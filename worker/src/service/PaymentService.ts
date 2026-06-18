import { D1Repository } from '../repository/D1Repository';
import type { OrderRow, Payway } from '../types';
import { randomId, randomOrderNo, randomPublicToken, signMbdParams } from '../utils/crypto';
import { LicenseService } from './LicenseService';

const MBD_WECHAT_H5_URL = 'https://newapi.mbd.pub/release/wx/prepay';
const MBD_ALIPAY_URL = 'https://newapi.mbd.pub/release/alipay/pay';
const MBD_ORDER_QUERY_URL = 'https://newapi.mbd.pub/release/main/search_order';
const PRODUCT_NAME = '公众号排版器 Pro 年费';
const PRO_DAYS = 365;

export interface PaymentConfig {
	appId: string;
	appKey: string;
	amountCents: number;
	publicBaseUrl: string;
}

export interface CreateOrderResult {
	orderNo: string;
	orderUrl: string;
	paymentUrl?: string;
	paymentHtml?: string;
}

interface MbdOrderQuery {
	order_id?: string;
	charge_id?: string;
	amount?: string | number;
	state?: string | number;
	payway?: string | number;
	refund_state?: string | number;
	refund_amount?: string | number;
	error?: string;
}

interface MbdWebhookBody {
	type?: string;
	data?: {
		out_trade_no?: string;
		amount?: number;
		charge_id?: string;
		payway?: number;
	};
}

export class PaymentService {
	constructor(
		private readonly repository: D1Repository,
		private readonly licenseService: LicenseService,
		private readonly config: PaymentConfig,
	) {}

	async createOrder(payway: Payway): Promise<CreateOrderResult> {
		const now = new Date().toISOString();
		const orderNo = randomOrderNo();
		const publicToken = randomPublicToken();
		const orderUrl = `${this.config.publicBaseUrl}/order/${encodeURIComponent(orderNo)}?token=${encodeURIComponent(publicToken)}`;
		let paymentUrl: string | undefined;
		let paymentHtml: string | undefined;

		if (payway === 'wechat_h5') {
			const response = await this.createWechatH5Payment(orderNo);
			paymentUrl = response.h5_url;
		} else {
			const response = await this.createAlipayPayment(orderNo, orderUrl);
			paymentHtml = response.body;
		}

		await this.repository.createOrder({
			order_no: orderNo,
			public_token: publicToken,
			status: 'pending',
			plan: 'pro',
			amount_cents: this.config.amountCents,
			payway,
			payment_provider: 'mbd',
			payment_url: paymentUrl ?? null,
			license_hash: null,
			license_key_ciphertext: null,
			created_at: now,
			updated_at: now,
		});

		return { orderNo, orderUrl, paymentUrl, paymentHtml };
	}

	async handleWebhook(body: MbdWebhookBody): Promise<{ ok: true; message: string }> {
		const now = new Date().toISOString();
		const orderNo = body.data?.out_trade_no ?? null;
		await this.repository.createPaymentEvent(randomId('payevt'), body.type ?? 'unknown', orderNo, JSON.stringify(body), now);
		if (body.type !== 'charge_succeeded' || !orderNo) {
			return { ok: true, message: 'ignored' };
		}

		const order = await this.repository.findOrder(orderNo);
		if (!order) {
			return { ok: true, message: 'unknown order' };
		}
		if (order.license_hash) {
			return { ok: true, message: 'already issued' };
		}

		const query = await this.queryPaidOrder(orderNo);
		this.assertPaidOrderMatches(order, query);
		const issued = await this.licenseService.issue({
			days: PRO_DAYS,
			source: 'mbd',
			orderNo,
			note: `mbd charge ${query.charge_id ?? ''}`.trim(),
			now,
		});
		const licenseKeyCiphertext = await this.licenseService.encryptLicenseKey(issued.licenseKey);
		await this.repository.markOrderIssued(
			orderNo,
			'issued',
			query.charge_id ?? '',
			now,
			now,
			issued.licenseHash,
			licenseKeyCiphertext,
			order.payment_url,
			JSON.stringify(query),
			now,
		);
		return { ok: true, message: 'issued' };
	}

	private async createWechatH5Payment(orderNo: string): Promise<{ h5_url: string }> {
		const params = {
			channel: 'h5',
			app_id: this.config.appId,
			description: PRODUCT_NAME,
			out_trade_no: orderNo,
			amount_total: this.config.amountCents,
		};
		const response = await postMbd<{ h5_url?: string; error?: string }>(MBD_WECHAT_H5_URL, {
			...params,
			sign: signMbdParams(params, this.config.appKey),
		});
		if (response.error || !response.h5_url) {
			throw new Error(response.error ?? '面包多没有返回微信支付链接');
		}
		return { h5_url: response.h5_url };
	}

	private async createAlipayPayment(orderNo: string, orderUrl: string): Promise<{ body: string }> {
		const params = {
			url: orderUrl,
			app_id: this.config.appId,
			description: PRODUCT_NAME,
			amount_total: this.config.amountCents,
			out_trade_no: orderNo,
			callback_url: orderUrl,
		};
		const response = await postMbd<{ body?: string; error?: string }>(MBD_ALIPAY_URL, {
			...params,
			sign: signMbdParams(params, this.config.appKey),
		});
		if (response.error || !response.body) {
			throw new Error(response.error ?? '面包多没有返回支付宝支付表单');
		}
		return { body: response.body };
	}

	private async queryPaidOrder(orderNo: string): Promise<MbdOrderQuery> {
		const params = {
			app_id: this.config.appId,
			out_trade_no: orderNo,
		};
		const response = await postMbd<MbdOrderQuery>(MBD_ORDER_QUERY_URL, {
			...params,
			sign: signMbdParams(params, this.config.appKey),
		});
		if (response.error) {
			throw new Error(response.error);
		}
		return response;
	}

	private assertPaidOrderMatches(order: OrderRow, query: MbdOrderQuery): void {
		const state = Number(query.state);
		if (state !== 1 && state !== 2) {
			throw new Error('订单尚未支付');
		}
		if (Number(query.amount) !== order.amount_cents) {
			throw new Error('订单金额不匹配');
		}
		if (Number(query.refund_state ?? 0) === 2) {
			throw new Error('订单已全额退款');
		}
	}
}

async function postMbd<T>(url: string, body: Record<string, string | number>): Promise<T> {
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	return response.json() as Promise<T>;
}
