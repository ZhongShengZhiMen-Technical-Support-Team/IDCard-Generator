import zhCN from './zh-CN';
import enUS from './en-US';

export default {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

export const ability_options = [
  {
    value: '御灵系',
    label: '御灵系',
    children: [
      { value: '金', label: '金' },
      { value: '木', label: '木' },
      { value: '水', label: '水' },
      { value: '火', label: '火' },
      { value: '土', label: '土' },
    ],
  },
  {
    value: '空间系',
    label: '空间系',
    children: [
      { value: '领域', label: '领域' },
      { value: '传送', label: '传送' },
      { value: '吞噬', label: '吞噬' },
    ],
  },
  {
    value: '造物系',
    label: '造物系'
  },
  {
    value: '生灵系',
    label: '生灵系'
  },
  {
    value: '心灵系',
    label: '心灵系'
  },
  {
    value: '乱七八糟系',
    label: '乱七八糟系'
  },
  {
    value: '',
    label: '其他'
  }
];