export type CodeTheme = 'light' | 'dark';
export type LayoutTheme =
	| 'green-blue'
	| 'black-white'
	| 'blue-indigo'
	| 'red'
	| 'pink'
	| 'yellow'
	| 'iron'
	| 'joker'
	| 'batman'
	| 'loki'
	| 'spider'
	| 'ivy';
export type FontWeight = 'light' | 'medium' | 'bold';
export type SubheadingStyle = 'number' | 'eye' | 'none';

export interface LayoutThemeOption {
	value: LayoutTheme;
	label: string;
	primary: string;
	secondary: string;
	swatch: string;
}

export interface LayoutThemeGroup {
	label: string;
	options: LayoutThemeOption[];
}

export interface PluginSettings {
	authorName: string;
	avatarUrl: string;
	showReadingTime: boolean;
	codeTheme: CodeTheme;
	layoutTheme: LayoutTheme;
	fontWeight: FontWeight;
	subheadingStyle: SubheadingStyle;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	authorName: '',
	avatarUrl: '',
	showReadingTime: true,
	codeTheme: 'dark',
	layoutTheme: 'green-blue',
	fontWeight: 'medium',
	subheadingStyle: 'number',
};

export const LAYOUT_THEME_GROUPS: LayoutThemeGroup[] = [
	{
		label: '颜色',
		options: [
			{ value: 'green-blue', label: '绿蓝', primary: 'rgb(41, 148, 128)', secondary: 'rgb(73, 200, 149)', swatch: 'linear-gradient(to right, rgb(41, 148, 128), rgb(73, 200, 149))' },
			{ value: 'black-white', label: '黑白', primary: 'rgb(85, 85, 85)', secondary: 'rgb(153, 153, 153)', swatch: 'linear-gradient(to right, rgb(85, 85, 85), rgb(153, 153, 153))' },
			{ value: 'blue-indigo', label: '蓝靛', primary: 'rgb(32, 91, 195)', secondary: 'rgb(166, 189, 231)', swatch: 'linear-gradient(to right, rgb(32, 91, 195), rgb(166, 189, 231))' },
			{ value: 'red', label: '红火', primary: 'rgb(187, 30, 30)', secondary: 'rgb(255, 73, 73)', swatch: 'linear-gradient(to right, rgb(187, 30, 30), rgb(255, 73, 73))' },
			{ value: 'pink', label: '桃红', primary: 'rgb(254, 126, 147)', secondary: 'rgb(254, 182, 164)', swatch: 'linear-gradient(to right, rgb(254, 126, 147), rgb(254, 182, 164))' },
			{ value: 'yellow', label: '金黄', primary: 'rgb(255, 163, 89)', secondary: 'rgb(254, 230, 145)', swatch: 'linear-gradient(to right, rgb(255, 163, 89), rgb(254, 230, 145))' },
		],
	},
	{
		label: '超英',
		options: [
			{ value: 'iron', label: '钢人', primary: 'rgb(208, 62, 53)', secondary: 'rgb(222, 172, 67)', swatch: 'linear-gradient(to right, rgb(208, 62, 53), rgb(222, 172, 67))' },
			{ value: 'joker', label: '小丑', primary: 'rgb(145, 124, 183)', secondary: 'rgb(186, 168, 228)', swatch: 'linear-gradient(to right, rgb(145, 124, 183), rgb(186, 168, 228))' },
			{ value: 'batman', label: '老爷', primary: 'rgb(78, 78, 78)', secondary: 'rgb(104, 180, 228)', swatch: 'linear-gradient(to right, rgb(78, 78, 78), rgb(104, 180, 228))' },
			{ value: 'loki', label: '洛基', primary: 'rgb(11, 69, 10)', secondary: 'rgb(214, 211, 174)', swatch: 'linear-gradient(to right, rgb(11, 69, 10), rgb(214, 211, 174))' },
			{ value: 'spider', label: '小虫', primary: 'rgb(126, 31, 39)', secondary: 'rgb(43, 107, 189)', swatch: 'linear-gradient(to right, rgb(126, 31, 39), rgb(43, 107, 189))' },
			{ value: 'ivy', label: '毒藤', primary: 'rgb(255, 99, 37)', secondary: 'rgb(55, 196, 18)', swatch: 'linear-gradient(to right, rgb(255, 99, 37), rgb(55, 196, 18))' },
		],
	},
];

export const LAYOUT_THEME_OPTIONS: LayoutThemeOption[] = LAYOUT_THEME_GROUPS.reduce<LayoutThemeOption[]>(
	(options, group) => options.concat(group.options),
	[],
);

export const FONT_WEIGHT_OPTIONS: Array<{ value: FontWeight; label: string }> = [
	{ value: 'light', label: '细' },
	{ value: 'medium', label: '中' },
	{ value: 'bold', label: '粗' },
];

export const SUBHEADING_STYLE_OPTIONS: Array<{ value: SubheadingStyle; label: string }> = [
	{ value: 'number', label: '数字' },
	{ value: 'eye', label: '眼睛' },
	{ value: 'none', label: '无' },
];

export const CODE_THEME_OPTIONS: Array<{ value: CodeTheme; label: string }> = [
	{ value: 'dark', label: 'Github Dark' },
	{ value: 'light', label: 'Github Light' },
];
