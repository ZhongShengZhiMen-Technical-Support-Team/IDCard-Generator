import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Form, Input, Button, Upload, Row, Col, Space,
  Typography, Divider, message, Tag, Select
} from 'antd';
import {
  EyeOutlined, DownloadOutlined, ReloadOutlined, UploadOutlined,
  IdcardOutlined, UserOutlined, TeamOutlined, BankOutlined,
  ExperimentOutlined, FileTextOutlined, PictureOutlined,
  LinkOutlined, CameraOutlined, GlobalOutlined,
  PlusOutlined, CloseOutlined, ManOutlined, ThunderboltOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Solar } from 'lunar-javascript';

const { Text } = Typography;

const CANVAS_WIDTH  = 900;
const CANVAS_HEIGHT = 600;
const PHOTO_X       = 40;
const PHOTO_Y       = 152;
const PHOTO_WIDTH   = 200;
const PHOTO_HEIGHT  = 260;

const GUILD_LIST = [
  { label: '无隶属会馆', value: '无隶属会馆', code: 'FR' },
  { label: '苍南会馆',   value: '苍南会馆',   code: 'CN' },
  { label: '灵溪会馆',   value: '灵溪会馆',   code: 'LX' },
  { label: '龙游会馆',   value: '龙游会馆',   code: 'LY' },
  { label: '流石会馆',   value: '流石会馆',   code: 'LS' },
  { label: '粤东会馆',   value: '粤东会馆',   code: 'YD' },
  { label: '洞桥会馆',   value: '洞桥会馆',   code: 'DQ' },
  { label: '燕京会馆',   value: '燕京会馆',   code: 'YJ' },
  { label: '黄河会馆',   value: '黄河会馆',   code: 'YR' },
  { label: '河海会馆',   value: '河海会馆',   code: 'HH' },
  { label: '榕城会馆',   value: '榕城会馆',   code: 'RC' },
  { label: '寒木会馆',   value: '寒木会馆',   code: 'HM' },
  { label: '花间会馆',   value: '花间会馆',   code: 'HJ' },
  { label: '茂竹会馆',   value: '茂竹会馆',   code: 'MZ' },
  { label: '风灵会馆',   value: '风灵会馆',   code: 'FL' },
  { label: '保密',       value: '保密',       code: 'SC' },
  { label: '其他',       value: '其他',       code: 'OT' },
];

const ABILITY_OPTIONS = [
  {
    value: '御灵系', label: '御灵系',
    children: [
      { value: '金', label: '金' },
      { value: '木', label: '木' },
      { value: '水', label: '水' },
      { value: '火', label: '火' },
      { value: '土', label: '土' },
    ],
  },
  { value: '空间系',     label: '空间系' },
  { value: '造物系',     label: '造物系' },
  { value: '生灵系',     label: '生灵系' },
  { value: '心灵系',     label: '心灵系' },
  { value: '锁御系',     label: '锁御系' },
  { value: '乱七八糟系', label: '乱七八糟系' },
];

const TIAN_GAN     = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DI_ZHI       = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const LUNAR_DAYS   = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
];
const MONTH_NAMES = ['一月','二月','三月','四月','五月','六月',
                     '七月','八月','九月','十月','十一月','十二月'];
const WEEK_NAMES  = ['日','一','二','三','四','五','六'];

// 五虎遁年起月：年干(index%5) → 寅月天干起始index
const YUE_GAN_START = [2, 4, 6, 8, 0];

// 五鼠遁日起时：日干(index%5) → 子时天干起始index
const SHI_GAN_START = [0, 2, 4, 6, 8];

// 儒略日基准：2000-01-01 = JD 2451545
const BASE_JD = 2451545;
const BASE_GZ_INDEX = (() => {
  try {
    const lunar = Solar.fromYmd(2000, 1, 1).getLunar();
    const gan_i = TIAN_GAN.indexOf(lunar.getDayGan());
    const zhi_i = DI_ZHI.indexOf(lunar.getDayZhi());
    for (let n = 0; n < 60; n++) {
      if (n % 10 === gan_i && n % 12 === zhi_i) return n;
    }
  } catch (err) {
  console.error(err);
}
  return 16; 
})();

// 公历→儒略日，支持公元前（内部转天文年，公元前1年=天文0年）
const date_to_jd = (real_year, month, day) => {
  const y = real_year > 0 ? real_year : real_year + 1;
  const is_gregorian = y > 1582 || (y === 1582 && month > 10)
    || (y === 1582 && month === 10 && day >= 15);
  const a  = Math.floor((14 - month) / 12);
  const yr = y + 4800 - a;
  const mo = month + 12 * a - 3;
  if (is_gregorian) {
    return day + Math.floor((153 * mo + 2) / 5) + 365 * yr
      + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
  }
  return day + Math.floor((153 * mo + 2) / 5) + 365 * yr
    + Math.floor(yr / 4) - 32083;
};

// 儒略日→60甲子序号
const jd_to_day_gz_index = (jd) =>
  ((BASE_GZ_INDEX + (jd - BASE_JD)) % 60 + 60) % 60;

// 范围外年干支：以2月4日近似立春切年，甲子年=公元4年
const get_year_gz_index_approx = (real_year, month, day) => {
  const gz_year = (month < 2 || (month === 2 && day < 4)) ? real_year - 1 : real_year;
  const astro   = gz_year > 0 ? gz_year : gz_year === 0 ? -1 : gz_year + 1;
  return {
    gan_index: ((astro - 4) % 10 + 10) % 10,
    zhi_index: ((astro - 4) % 12 + 12) % 12,
  };
};

// 日历显示用年干支（按公历年，不切立春）
const get_ganzhi_year_for_display = (real_year) => {
  const astro = real_year > 0 ? real_year : real_year + 1;
  const g = ((astro - 4) % 10 + 10) % 10;
  const z = ((astro - 4) % 12 + 12) % 12;
  return `${TIAN_GAN[g]}${DI_ZHI[z]}`;
};

// 各月节气近似日（index=month-1），用于范围外月柱推算
const JIEQI_APPROX = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7];

// 范围外月干支：节气近似切月 + 五虎遁推月干
const get_month_gz_approx = (real_year, month, day) => {
  const { gan_index: ygi } = get_year_gz_index_approx(real_year, month, day);
  const before   = day < JIEQI_APPROX[month - 1];
  const jm0      = before ? ((month - 2 + 12) % 12) : ((month - 1) % 12); // 节气月索引，0=寅月
  const zhi_idx  = (jm0 + 2) % 12; // 寅=2
  const gan_idx  = (YUE_GAN_START[ygi % 5] + jm0) % 10;
  return `${TIAN_GAN[gan_idx]}${DI_ZHI[zhi_idx]}`;
};

// 时辰索引：晚子时(23点)归当日
const hour_to_shichen_index = (hour) => {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
};

// 五鼠遁推时间干支
const get_hour_gz = (day_gz_index, hour) => {
  const ri  = day_gz_index % 10;
  const shi = hour_to_shichen_index(hour);
  return `${TIAN_GAN[(SHI_GAN_START[ri % 5] + shi) % 10]}${DI_ZHI[shi]}`;
};

// 范围外伪农历：干支准确，月日近似，保证格式合理
const fake_lunar_month_day = (real_year, month, day) => {
  const seed = ((Math.abs(real_year) * 31 + month * 7 + day) % 100 + 100) % 100;
  let fm = month - 1 - (seed % 2);
  let fd = day - 10 - (seed % 6);
  if (fd < 1)  { fd += 30; fm -= 1; }
  if (fm < 1)  fm += 12;
  if (fd > 30) fd = 30;
  if (fd < 1)  fd = 1;
  return { lunar_month: fm, lunar_day: fd };
};

// 主转换：1900-2100年参照库精确计算，范围外用近似公式
const get_bazi_and_lunar = (real_year, month, day, hour = null) => {
  if (real_year >= 1900 && real_year <= 2100) {
    try {
      const solar = Solar.fromYmd(real_year, month, day);
      const lunar = solar.getLunar();
      const yg = lunar.getYearGanByLiChun(); // 按立春切年
      const yz = lunar.getYearZhiByLiChun();
      const mg = lunar.getMonthGan();         // 按节气切月
      const mz = lunar.getMonthZhi();
      const dg = lunar.getDayGan();
      const dz = lunar.getDayZhi();
      let hour_gz = null;
      if (hour !== null) {
        const ri  = TIAN_GAN.indexOf(dg);
        const shi = hour_to_shichen_index(hour);
        hour_gz = `${TIAN_GAN[(SHI_GAN_START[ri % 5] + shi) % 10]}${DI_ZHI[shi]}`;
      }
      const lm = Math.abs(lunar.getMonth()); // 闰月为负，取绝对值
      const ld = lunar.getDay();
      return {
        year_gz: `${yg}${yz}`, month_gz: `${mg}${mz}`, day_gz: `${dg}${dz}`,
        hour_gz,
        lunar_month_str: `${LUNAR_MONTHS[lm - 1]}月`,
        lunar_day_str: LUNAR_DAYS[ld - 1],
        is_accurate: true,
      };
    } catch (err) {
  console.error(err);
}
  }

  const { gan_index, zhi_index } = get_year_gz_index_approx(real_year, month, day);
  const jd      = date_to_jd(real_year, month, day);
  const gz_idx  = jd_to_day_gz_index(jd);
  const { lunar_month, lunar_day } = fake_lunar_month_day(real_year, month, day);
  let hour_gz = null;
  if (hour !== null) hour_gz = get_hour_gz(gz_idx, hour);
  return {
    year_gz:  `${TIAN_GAN[gan_index]}${DI_ZHI[zhi_index]}`,
    month_gz: get_month_gz_approx(real_year, month, day),
    day_gz:   `${TIAN_GAN[gz_idx % 10]}${DI_ZHI[gz_idx % 12]}`,
    hour_gz,
    lunar_month_str: `${LUNAR_MONTHS[lunar_month - 1]}月`,
    lunar_day_str:   LUNAR_DAYS[lunar_day - 1],
    is_accurate: false,
  };
};

const format_bazi = (real_year, month, day, hour = null) => {
  const { year_gz, month_gz, day_gz, hour_gz } = get_bazi_and_lunar(real_year, month, day, hour);
  return hour_gz
    ? `${year_gz} ${month_gz} ${day_gz} ${hour_gz}`
    : `${year_gz} ${month_gz} ${day_gz}`;
};

const format_lunar = (real_year, month, day) => {
  const { year_gz, lunar_month_str, lunar_day_str } = get_bazi_and_lunar(real_year, month, day);
  return `${year_gz}年${lunar_month_str}${lunar_day_str}`;
};

const format_solar = (real_year, month, day) =>
  `${real_year < 0 ? '公元前' : ''}${Math.abs(real_year)}年${String(month).padStart(2,'0')}月${String(day).padStart(2,'0')}日`;

const calc_age = (real_year, month, day) => {
  const now = dayjs();
  const ny = now.year(), nm = now.month() + 1, nd = now.date();
  let age = ny - real_year;
  if (real_year < 0 && ny > 0) age -= 1;
  if (!(nm > month || (nm === month && nd >= day))) age -= 1;
  return age;
};

const is_leap_year = (real_year) => {
  const y = real_year > 0 ? real_year : real_year + 1;
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
};

const days_in_month = (real_year, month) => {
  const days = [31,28,31,30,31,30,31,31,30,31,30,31];
  if (month === 2 && is_leap_year(real_year)) return 29;
  return days[month - 1];
};

const get_first_weekday = (real_year, month) => {
  const jd = date_to_jd(real_year, month, 1);
  return ((jd + 1) % 7 + 7) % 7;
};

const rand_5 = () => String(Math.floor(Math.random() * 90000) + 10000);
const get_guild_code = (v) => { const f = GUILD_LIST.find(g => g.value === v); return f ? f.code : 'OT'; };

const draw_round_rect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const nav_btn_style = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: '#595959', padding: '2px 5px',
  borderRadius: 4, lineHeight: 1, fontWeight: 600,
};
const text_btn_style = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 12, padding: '2px 4px', fontWeight: 500,
};

function CustomDatePicker({ value, onChange }) {
  const today  = dayjs();
  const init_ry = value ? value.real_year : today.year();
  const init_m  = value ? value.month     : today.month() + 1;

  const [open,         set_open]         = useState(false);
  const [view,         set_view]         = useState('day');
  const [date_state,   set_date_state]   = useState({
    real_year:  init_ry,
    month:      init_m,
    is_bc:      init_ry < 0,
    year_input: String(Math.abs(init_ry)),
  });
  const [editing_year, set_editing_year] = useState(false);

  const { real_year, month, is_bc, year_input } = date_state;

  const set_real_year  = (v) => set_date_state(s => ({ ...s, real_year: v }));
  const set_month      = (v) => set_date_state(s => ({ ...s, month: v }));
  const set_is_bc      = (v) => set_date_state(s => ({ ...s, is_bc: v }));
  const set_year_input = (v) => set_date_state(s => ({ ...s, year_input: v }));

  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) set_open(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (value) {
      setTimeout(() => {
        set_date_state({
          real_year:  value.real_year,
          month:      value.month,
          is_bc:      value.real_year < 0,
          year_input: String(Math.abs(value.real_year)),
        });
      }, 0);
    }
  }, [value]);

  const change_year = (delta) => {
    let ny = real_year + delta;
    if (delta > 0 && real_year === -1) ny = 1;
    if (delta < 0 && real_year ===  1) ny = -1;
    if (ny === 0) ny = delta > 0 ? 1 : -1;
    set_real_year(ny); set_is_bc(ny < 0); set_year_input(String(Math.abs(ny)));
  };

  const toggle_bc = () => {
    const ny = -real_year;
    const actual = ny === 0 ? (is_bc ? 1 : -1) : ny;
    set_real_year(actual); set_is_bc(actual < 0);
  };

  const confirm_year_input = () => {
    const abs_val = Math.max(1, Math.abs(parseInt(year_input) || 1));
    const ny = is_bc ? -abs_val : abs_val;
    set_real_year(ny); set_year_input(String(abs_val)); set_editing_year(false);
  };

  const select_day = (d) => {
    onChange && onChange({ real_year, month, day: Math.min(d, days_in_month(real_year, month)) });
    set_open(false);
  };

  const go_today = () => {
    const ry = today.year(), m = today.month() + 1, d = today.date();
    set_date_state({ real_year: ry, month: m, is_bc: false, year_input: String(ry) });
    onChange && onChange({ real_year: ry, month: m, day: d });
    set_open(false);
  };

  const clear = () => { onChange && onChange(null); set_open(false); };

  const prev_month = () => {
    if (month === 1) { change_year(-1); set_month(12); }
    else set_month(m => m - 1);
  };
  const next_month = () => {
    if (month === 12) { change_year(1); set_month(1); }
    else set_month(m => m + 1);
  };

  const calendar_days = useMemo(() => {
    const first_wd   = get_first_weekday(real_year, month);
    const total      = days_in_month(real_year, month);
    const prev_m     = month === 1 ? 12 : month - 1;
    const prev_ry    = month === 1 ? (real_year === 1 ? -1 : real_year - 1) : real_year;
    const prev_total = days_in_month(prev_ry, prev_m);
    const cells = [];
    for (let i = 0; i < first_wd; i++)
      cells.push({ day: prev_total - first_wd + 1 + i, current: false });
    for (let d = 1; d <= total; d++)
      cells.push({ day: d, current: true });
    let nd = 1;
    while (cells.length % 7 !== 0 || cells.length < 35)
      cells.push({ day: nd++, current: false });
    return cells;
  }, [real_year, month]);

  const display_str  = value
    ? `${value.real_year < 0 ? '公元前' : ''}${Math.abs(value.real_year)}年${String(value.month).padStart(2,'0')}月${String(value.day).padStart(2,'0')}日`
    : '';
  const selected_day = value && value.real_year === real_year && value.month === month ? value.day : null;
  const gz_label     = get_ganzhi_year_for_display(real_year);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => set_open(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 11px', borderRadius: 6, cursor: 'pointer',
        border: open ? '1px solid #3e8868' : '1px solid #d9d9d9',
        background: '#fff', minHeight: 32,
        boxShadow: open ? '0 0 0 2px rgba(62,136,104,0.1)' : 'none',
        transition: 'all 0.2s',
      }}>
        <CalendarOutlined style={{ color: '#bfbfbf', fontSize: 13 }} />
        <span style={{ flex: 1, fontSize: 14, color: display_str ? '#1a1a1a' : '#bfbfbf' }}>
          {display_str || '选择出生日期'}
        </span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 38, left: 0, zIndex: 1000,
          background: '#fff', borderRadius: 10,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          border: '1px solid #f0f0f0', width: 300,
          overflow: 'hidden', userSelect: 'none',
        }}>
          <div style={{ padding: '10px 12px', background: '#f8faf7', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                <button onClick={() => change_year(-100)} style={nav_btn_style} title="上一世纪">{'<<<'}</button>
                <button onClick={() => change_year(-10)}  style={nav_btn_style} title="上十年">{'<<'}</button>
                <button onClick={() => change_year(-1)}   style={nav_btn_style} title="上一年">{'<'}</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
                <button onClick={toggle_bc} style={{
                  fontSize: 11, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                  border: '1px solid ' + (is_bc ? '#ff7875' : '#3e8868'),
                  background: is_bc ? '#fff1f0' : '#f0faf4',
                  color: is_bc ? '#ff4d4f' : '#3e8868', fontWeight: 600,
                }}>
                  {is_bc ? '公元前' : '公元'}
                </button>
                {editing_year ? (
                  <input autoFocus value={year_input}
                    onChange={e => set_year_input(e.target.value.replace(/\D/g, ''))}
                    onBlur={confirm_year_input}
                    onKeyDown={e => { if (e.key === 'Enter') confirm_year_input(); }}
                    style={{
                      width: 60, textAlign: 'center', fontSize: 15, fontWeight: 700,
                      border: '1px solid #3e8868', borderRadius: 4, outline: 'none', padding: '1px 4px',
                    }}
                  />
                ) : (
                  <span onClick={() => set_editing_year(true)} title="点击直接输入年份"
                    style={{ fontSize: 15, fontWeight: 700, cursor: 'text', color: '#1a1a1a', minWidth: 40, textAlign: 'center' }}>
                    {Math.abs(real_year)}
                  </span>
                )}
                <span style={{ fontSize: 14, color: '#595959' }}>年</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                <button onClick={() => change_year(1)}   style={nav_btn_style} title="下一年">{'>'}</button>
                <button onClick={() => change_year(10)}  style={nav_btn_style} title="下十年">{'>>'}</button>
                <button onClick={() => change_year(100)} style={nav_btn_style} title="下一世纪">{'>>>'}</button>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#8c8c8c' }}>{gz_label}年</div>
          </div>

          {view === 'month' ? (
            <div style={{ padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {MONTH_NAMES.map((mn, i) => (
                  <button key={i} onClick={() => { set_month(i + 1); set_view('day'); }} style={{
                    padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontSize: 13, border: 'none',
                    background: month === i + 1 ? '#3e8868' : '#f5f5f5',
                    color:      month === i + 1 ? '#fff'    : '#1a1a1a',
                    fontWeight: month === i + 1 ? 700       : 400,
                  }}>{mn}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '0 12px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 4px' }}>
                <button onClick={prev_month} style={nav_btn_style}>{'<'}</button>
                <button onClick={() => set_view('month')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                  {MONTH_NAMES[month - 1]}
                </button>
                <button onClick={next_month} style={nav_btn_style}>{'>'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                {WEEK_NAMES.map(w => (
                  <div key={w} style={{ textAlign: 'center', fontSize: 11, color: '#8c8c8c', padding: '2px 0' }}>{w}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {calendar_days.map((cell, i) => {
                  const is_sel   = cell.current && cell.day === selected_day;
                  const is_today = cell.current && real_year === today.year()
                    && month === today.month() + 1 && cell.day === today.date();
                  return (
                    <button key={i} onClick={() => cell.current && select_day(cell.day)} style={{
                      padding: '5px 0', borderRadius: 6,
                      cursor: cell.current ? 'pointer' : 'default',
                      border: is_today && !is_sel ? '1px solid #3e8868' : '1px solid transparent',
                      background: is_sel ? '#3e8868' : 'none',
                      color: is_sel ? '#fff' : cell.current ? '#1a1a1a' : '#d9d9d9',
                      fontSize: 12, fontWeight: is_sel ? 700 : 400,
                    }}>
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px', borderTop: '1px solid #f0f0f0', background: '#fafafa',
          }}>
            <button onClick={go_today} style={{ ...text_btn_style, color: '#3e8868' }}>今天</button>
            <button onClick={clear}    style={{ ...text_btn_style, color: '#ff4d4f' }}>清除</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [form] = Form.useForm();
  const canvas_ref = useRef(null);

  // 图片用 ref 存储，避免 state 变化触发渲染循环
  const current_bg_ref   = useRef(null);
  const photo_image_ref  = useRef(null);

  const [has_bg,    set_has_bg]    = useState(false);
  const [has_photo, set_has_photo] = useState(false);

  const [selected_abilities, set_selected_abilities] = useState([]);
  const [date_mode,          set_date_mode]          = useState('solar');
  const [cert_number,        set_cert_number]        = useState('—');
  const [guild_other_text,   set_guild_other_text]   = useState('');
  const [birth_date,         set_birth_date]         = useState(null);
  const [birth_hour,         set_birth_hour]         = useState(null);

  const issue_date_str = useMemo(() => dayjs().format('YYYY年MM月DD日'), []);

  const draw_card = useCallback(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const values = form.getFieldsValue();

    const name          = values.name     || '';
    const race          = values.race     || '';
    const gender        = values.gender   || '';
    const position      = values.position || '';
    const guild_val     = values.guild    || '';
    const guild_display = guild_val === '其他' ? (guild_other_text || '其他') : guild_val;
    const photo_image   = photo_image_ref.current;
    const current_bg    = current_bg_ref.current;

    let birth_label = '出生日期 / Birth';
    let birth_str   = '—';

    if (birth_date) {
      const { real_year, month, day } = birth_date;
      if (date_mode === 'age') {
        birth_label = '年龄 / Age';
        birth_str   = `${calc_age(real_year, month, day)}岁`;
      } else if (date_mode === 'bazi') {
        birth_label = '八字 / BaZi';
        birth_str   = format_bazi(real_year, month, day, birth_hour);
      } else if (date_mode === 'lunar') {
        birth_label = '农历 / Lunar';
        birth_str   = format_lunar(real_year, month, day);
      } else {
        birth_str = format_solar(real_year, month, day);
      }
    }

    // 能力标签：[系别, 属性, 名称] → "系别·属性·名称"
    const ability_tags = selected_abilities
      .map(ab => {
        if (!ab || !ab[0]) return null;
        const parts = [ab[0]];
        if (ab[1]) parts.push(ab[1]);
        if (ab[2]) parts.push(ab[2]);
        return parts.join('·');
      })
      .filter(Boolean);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 背景：有底图则叠加遮罩，否则渐变色
    if (current_bg) {
      ctx.drawImage(current_bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(240, 238, 233, 0.55)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, '#e9f0e6'); grad.addColorStop(1, '#cfdbc8');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }


    const wgrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    wgrad.addColorStop(0,   'rgba(180,220,150,0.08)');
    wgrad.addColorStop(0.5, 'rgba(200,230,160,0.25)');
    wgrad.addColorStop(1,   'rgba(180,220,150,0.08)');
    ctx.fillStyle = wgrad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 社区大标题
    ctx.font = 'bold 38px "Times New Roman","思源黑体"';
    ctx.fillStyle = '#3b5c2a';
    ctx.fillText('众生之门社区', 38, 62);
    ctx.font = 'italic 16px "Segoe UI"';
    ctx.fillStyle = '#5e7c48';
    ctx.fillText('zscommunity', 42, 85);
    ctx.beginPath();
    ctx.moveTo(38, 100); ctx.lineTo(CANVAS_WIDTH - 38, 100);
    ctx.strokeStyle = 'rgba(62,136,104,0.25)'; ctx.lineWidth = 1; ctx.stroke();

    // 靓妖照骗
    const radius = 8;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
    draw_round_rect(ctx, PHOTO_X - 4, PHOTO_Y - 4, PHOTO_WIDTH + 8, PHOTO_HEIGHT + 8, radius + 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    if (photo_image) {
      draw_round_rect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
      ctx.save(); ctx.clip();
      const ir = photo_image.width / photo_image.height;
      const br = PHOTO_WIDTH / PHOTO_HEIGHT;
      let dw, dh, dx, dy;
      if (ir > br) { dh = PHOTO_HEIGHT; dw = dh * ir; dx = PHOTO_X - (dw - PHOTO_WIDTH) / 2; dy = PHOTO_Y; }
      else         { dw = PHOTO_WIDTH;  dh = dw / ir; dx = PHOTO_X; dy = PHOTO_Y - (dh - PHOTO_HEIGHT) / 2; }
      ctx.drawImage(photo_image, dx, dy, dw, dh);
      ctx.restore();
    } else {
      draw_round_rect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
      ctx.fillStyle = '#e8e8e8'; ctx.fill();
      ctx.fillStyle = '#8c8c8c';
      ctx.font = '12px "Segoe UI","Microsoft YaHei"';
      ctx.textAlign = 'center';
      ctx.fillText('证件照片', PHOTO_X + PHOTO_WIDTH / 2, PHOTO_Y + PHOTO_HEIGHT / 2 + 50);
      ctx.textAlign = 'start';
    }
    draw_round_rect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();

    // 右侧信息区：3行2列
    const LF     = 'bold 14px "Segoe UI","PingFang SC"';
    const VF     = 'bold 21px "Segoe UI","Microsoft YaHei"';
    const LC     = '#2a5a3a';
    const VC     = '#1a3a28';
    const INFO_X = PHOTO_X + PHOTO_WIDTH + 90;
    const COL2_X = INFO_X + 260;
    const ROW_H  = 68;
    const INFO_Y = PHOTO_Y + 12;

    const rows = [
      { l1: '姓名 / Name',   v1: name,      l2: '种族 / Race',      v2: race          },
      { l1: '性别 / Gender', v1: gender,    l2: '职业 / Work',      v2: position      },
      { l1: birth_label,     v1: birth_str, l2: '隶属会馆 / Guild', v2: guild_display },
    ];

    rows.forEach((row, i) => {
      const y = INFO_Y + i * ROW_H;
      ctx.font = LF; ctx.fillStyle = LC;
      ctx.fillText(row.l1, INFO_X, y);
      ctx.font = VF; ctx.fillStyle = VC;
      ctx.fillText(row.v1 || '—', INFO_X, y + 26);
      ctx.font = LF; ctx.fillStyle = LC;
      ctx.fillText(row.l2, COL2_X, y);
      ctx.font = VF; ctx.fillStyle = VC;
      ctx.fillText(row.v2 || '—', COL2_X, y + 26);
    });

    // 能力横条分隔线
    const DIV_Y = INFO_Y + 3 * ROW_H - 10;
    ctx.beginPath();
    ctx.moveTo(INFO_X, DIV_Y); ctx.lineTo(CANVAS_WIDTH - 38, DIV_Y);
    ctx.strokeStyle = 'rgba(62,136,104,0.2)'; ctx.lineWidth = 1; ctx.stroke();

    // 能力标签区：横向排列，超出换行
    const AB_LABEL_Y = INFO_Y + 3 * ROW_H + 16;
    ctx.font = LF; ctx.fillStyle = LC;
    ctx.fillText('能力 / Ability', INFO_X, AB_LABEL_Y);

    if (ability_tags.length === 0) {
      ctx.font = VF; ctx.fillStyle = VC;
      ctx.fillText('—', INFO_X, AB_LABEL_Y + 26);
    } else {
      const TAG_FONT  = 'bold 18px "Segoe UI","Microsoft YaHei"';
      const TAG_PX    = 12;
      const TAG_H     = 30;
      const TAG_GAP_X = 8;
      const TAG_GAP_Y = 8;
      const AREA_X    = INFO_X;
      const AREA_W    = CANVAS_WIDTH - 38 - AREA_X;
      const TAG_Y0    = AB_LABEL_Y + 8;

      ctx.font = TAG_FONT;
      let cx = AREA_X;
      let cy = TAG_Y0;

      ability_tags.forEach(tag => {
        const tw   = ctx.measureText(tag).width;
        const tagw = tw + TAG_PX * 2;

        if (cx > AREA_X && cx + tagw > AREA_X + AREA_W) {
          cx = AREA_X;
          cy += TAG_H + TAG_GAP_Y;
        }

        draw_round_rect(ctx, cx, cy, tagw, TAG_H, 6);
        ctx.fillStyle = 'rgba(62,136,104,0.12)'; ctx.fill();
        draw_round_rect(ctx, cx, cy, tagw, TAG_H, 6);
        ctx.strokeStyle = 'rgba(62,136,104,0.35)'; ctx.lineWidth = 1; ctx.stroke();

        ctx.fillStyle = VC;
        ctx.fillText(tag, cx + TAG_PX, cy + TAG_H / 2 + 7);

        cx += tagw + TAG_GAP_X;
      });
    }

    // 底部三栏
    const BOT_DIV_Y = CANVAS_HEIGHT - 88;
    ctx.beginPath();
    ctx.moveTo(38, BOT_DIV_Y); ctx.lineTo(CANVAS_WIDTH - 38, BOT_DIV_Y);
    ctx.strokeStyle = 'rgba(62,136,104,0.25)'; ctx.lineWidth = 1; ctx.stroke();

    const BLY = CANVAS_HEIGHT - 56;
    const BVY = CANVAS_HEIGHT - 32;

    const draw_bottom = (label, val, x, align) => {
      ctx.textAlign = align;
      ctx.font = LF; ctx.fillStyle = LC; ctx.fillText(label, x, BLY);
      ctx.font = VF; ctx.fillStyle = VC; ctx.fillText(val,   x, BVY);
    };
    draw_bottom('证件编号 / No.',       cert_number,     38,               'left');
    draw_bottom('签发日期 / Date',      issue_date_str,  CANVAS_WIDTH / 2, 'center');
    draw_bottom('签发机关 / Authority', '众生之门技术部', CANVAS_WIDTH - 38, 'right');
    ctx.textAlign = 'start';

  }, [selected_abilities, date_mode, cert_number, guild_other_text,
      birth_date, birth_hour, issue_date_str, form]);

  useEffect(() => { draw_card(); }, [draw_card]);

  const handle_form_change = (changed) => {
    if (changed.guild !== undefined) {
      if (changed.guild === '—') {
        set_cert_number('—');
      } else {
        const code = get_guild_code(changed.guild);
        set_cert_number(`${code}-${rand_5()}`);
      }
    }
    draw_card();
  };

  const handle_add_ability    = () => set_selected_abilities(p => [...p, [null, null, '']]);
  const handle_ability_change = (i, v) => set_selected_abilities(p => { const n = [...p]; n[i] = v; return n; });
  const handle_remove_ability = (i)    => set_selected_abilities(p => p.filter((_, idx) => idx !== i));

  const handle_download = () => {
    const canvas = canvas_ref.current;
    if (!canvas) { message.error('画布未加载'); return; }
    const link = document.createElement('a');
    link.download = `ZSCommunity_${form.getFieldValue('name') || 'card'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    message.success('证件已保存');
  };

  const load_bg_from_url = (url) => {
    if (!url) { current_bg_ref.current = null; set_has_bg(false); draw_card(); return; }
    const img = new Image(); img.crossOrigin = 'Anonymous';
    img.onload  = () => { current_bg_ref.current = img; set_has_bg(true); draw_card(); };
    img.onerror = () => { current_bg_ref.current = null; set_has_bg(false); draw_card(); message.warning('背景图片加载失败'); };
    img.src = url;
  };

  const handle_bg_upload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { current_bg_ref.current = img; set_has_bg(true); draw_card(); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handle_remove_bg = () => {
    current_bg_ref.current = null;
    set_has_bg(false);
    form.setFieldsValue({ bg_url: '' });
    draw_card();
    message.info('底图已移除');
  };

  const handle_photo_upload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { photo_image_ref.current = img; set_has_photo(true); draw_card(); message.success('照片已上传'); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handle_remove_photo = () => {
    photo_image_ref.current = null;
    set_has_photo(false);
    draw_card();
    message.info('照片已移除');
  };

  const hour_options = Array.from({ length: 24 }, (_, i) => ({
    value: i, label: `${String(i).padStart(2,'0')}:00 - ${String(i).padStart(2,'0')}:59`,
  }));

  const date_mode_options = [
    { value: 'solar', label: '阳历' },
    { value: 'lunar', label: '农历' },
    { value: 'bazi',  label: '八字' },
    { value: 'age',   label: '年龄' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 1200 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <IdcardOutlined style={{ fontSize: 26, color: '#3e8868', marginRight: 10 }} />
          <span style={{ fontSize: 28, fontWeight: 600 }}>妖精证件生成器</span>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={10}>
            <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} styles={{ body: { padding: 0 } }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: '#3e8868' }} />
                <span style={{ fontWeight: 600 }}>你的档案</span>
              </div>
              <div style={{ padding: 24 }}>
                <Form form={form} layout="vertical" onValuesChange={handle_form_change}
                  initialValues={{ gender: '—', guild: '—' }}>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <CameraOutlined style={{ color: '#595959' }} />
                      <span style={{ fontWeight: 500, color: '#595959' }}>证件照片</span>
                      <Tag style={{ fontSize: 11 }}>可选</Tag>
                    </div>
                    <Space>
                      <Upload beforeUpload={handle_photo_upload} showUploadList={false} accept="image/*">
                        <Button icon={<CameraOutlined />} style={{ borderRadius: 6 }}>
                          {has_photo ? '更换照片' : '上传照片'}
                        </Button>
                      </Upload>
                      {has_photo && (
                        <Button danger onClick={handle_remove_photo} style={{ borderRadius: 6 }}>移除照片</Button>
                      )}
                    </Space>
                  </div>

                  <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={<span><UserOutlined style={{ marginRight: 4 }} />名字</span>} name="name">
                        <Input placeholder="请输入您的名字" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={<span><TeamOutlined style={{ marginRight: 4 }} />种族</span>} name="race">
                        <Input placeholder="请输入种族" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={<span><ManOutlined style={{ marginRight: 4 }} />性别</span>} name="gender">
                        <Select style={{ borderRadius: 6 }}>
                          {['—','无','男','女','其他'].map(g => (
                            <Select.Option key={g} value={g}>{g}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={<span><ExperimentOutlined style={{ marginRight: 4 }} />职业</span>} name="position">
                        <Input placeholder="请输入您的职业" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#595959', marginBottom: 6 }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />出生日期
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <CustomDatePicker value={birth_date} onChange={v => set_birth_date(v)} />
                      </div>
                      {date_mode === 'bazi' && (
                        <Select value={birth_hour} onChange={v => set_birth_hour(v ?? null)}
                          placeholder="时辰" style={{ width: 150 }} allowClear>
                          {hour_options.map(o => (
                            <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>出生日期显示方式</div>
                    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                      {date_mode_options.map((opt, idx) => (
                        <button key={opt.value} onClick={() => {
                          if (opt.value !== 'bazi') set_birth_hour(null);
                          set_date_mode(opt.value);
                        }} style={{
                          flex: 1, padding: '7px 0', fontSize: 13, cursor: 'pointer', border: 'none',
                          borderRight: idx < date_mode_options.length - 1 ? '1px solid #e8e8e8' : 'none',
                          background: date_mode === opt.value ? '#3e8868' : '#fff',
                          color:      date_mode === opt.value ? '#fff'    : '#595959',
                          fontWeight: date_mode === opt.value ? 600       : 400,
                          transition: 'all 0.2s',
                        }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>

                  <Form.Item label={<span><BankOutlined style={{ marginRight: 4 }} />隶属会馆</span>} name="guild">
                    <Select placeholder="选择会馆" style={{ borderRadius: 6 }}>
                      <Select.Option value="—">—</Select.Option>
                      {GUILD_LIST.map(g => (
                        <Select.Option key={g.value} value={g.value}>{g.label}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate={(p, c) => p.guild !== c.guild}>
                    {({ getFieldValue }) => getFieldValue('guild') === '其他' ? (
                      <Input placeholder="请输入会馆名称" value={guild_other_text}
                        onChange={e => set_guild_other_text(e.target.value)}
                        style={{ borderRadius: 6, marginTop: -16, marginBottom: 16 }} />
                    ) : null}
                  </Form.Item>

                  <div style={{ marginBottom: 20, padding: '10px 14px', background: '#f5f5f5', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>证件编号</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', letterSpacing: 1 }}>{cert_number}</div>
                  </div>

                  <Divider style={{ margin: '4px 0 16px', borderColor: '#f0f0f0' }} />

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <ThunderboltOutlined style={{ color: '#595959' }} />
                      <span style={{ fontWeight: 500, color: '#595959' }}>能力</span>
                    </div>
                    {selected_abilities.map((ability, index) => (
                      <div key={index} style={{
                        display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12,
                        padding: '8px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0',
                      }}>
                        {/* 御灵系滴五行属性，手机屏幕过窄应换行；其余系别正常一行显示 */}
                        {ability?.[0] === '御灵系' ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Select value={ability?.[0] || undefined}
                              onChange={val => handle_ability_change(index, [val, null, ability?.[2] || ''])}
                              placeholder="系别" style={{ width: 110 }}>
                              {ABILITY_OPTIONS.map(opt => (
                                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                              ))}
                            </Select>
                            <Select value={ability?.[1] || undefined}
                              onChange={val => handle_ability_change(index, [ability[0], val, ability?.[2] || ''])}
                              placeholder="属性" style={{ width: 90 }} allowClear>
                              {ABILITY_OPTIONS[0].children.map(c => (
                                <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>
                              ))}
                            </Select>
                            <Input value={ability?.[2] || ''}
                              onChange={e => handle_ability_change(index, [ability?.[0], ability?.[1], e.target.value])}
                              placeholder="能力名称" style={{ flex: 1, minWidth: 120, borderRadius: 6 }} />
                            <Button type="text" danger icon={<CloseOutlined />}
                              onClick={() => handle_remove_ability(index)} size="small" />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Select value={ability?.[0] || undefined}
                              onChange={val => handle_ability_change(index, [val, null, ability?.[2] || ''])}
                              placeholder="系别" style={{ width: 110 }}>
                              {ABILITY_OPTIONS.map(opt => (
                                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                              ))}
                            </Select>
                            <Input value={ability?.[2] || ''}
                              onChange={e => handle_ability_change(index, [ability?.[0], ability?.[1], e.target.value])}
                              placeholder="能力名称" style={{ flex: 1, borderRadius: 6 }} />
                            <Button type="text" danger icon={<CloseOutlined />}
                              onClick={() => handle_remove_ability(index)} size="small" />
                          </div>
                        )}
                      </div>
                    ))}
                    <Button type="dashed" onClick={handle_add_ability} block icon={<PlusOutlined />}
                      style={{ borderRadius: 6, height: 36, borderColor: '#d9d9d9', color: '#595959' }}>
                      添加能力
                    </Button>
                  </div>

                  <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <PictureOutlined style={{ color: '#595959' }} />
                      <span style={{ fontWeight: 500, color: '#595959' }}>底图</span>
                      <Tag style={{ fontSize: 11 }}>可选</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>支持输入图片URL或上传本地文件</div>
                    <Form.Item name="bg_url" style={{ marginBottom: 12 }}>
                      <Input prefix={<LinkOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="输入图片URL地址" style={{ borderRadius: 6 }}
                        onBlur={e => { if (e.target.value) load_bg_from_url(e.target.value); }} />
                    </Form.Item>
                    <Space>
                      <Upload beforeUpload={handle_bg_upload} showUploadList={false} accept="image/*">
                        <Button icon={<UploadOutlined />} style={{ borderRadius: 6, height: 36 }}>本地上传</Button>
                      </Upload>
                      {has_bg && (
                        <Button danger onClick={handle_remove_bg} style={{ borderRadius: 6, height: 36 }}>移除底图</Button>
                      )}
                    </Space>
                  </div>

                  <Space direction="vertical" style={{ width: '100%', marginTop: 8 }} size={10}>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={draw_card} block
                      style={{ background: '#3e8868', borderColor: '#3e8868', borderRadius: 6, height: 40, fontWeight: 500 }}>
                      刷新证件
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={handle_download} block
                      style={{ borderRadius: 6, height: 40, borderColor: '#d9d9d9' }}>
                      保存图片
                    </Button>
                  </Space>
                </Form>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} styles={{ body: { padding: 0 } }}>
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeOutlined />
                <span style={{ fontWeight: 500, color: '#595959' }}>预览</span>
              </div>
              <div style={{ padding: 16, background: '#fafaf9' }}>
                <canvas ref={canvas_ref} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
                  style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block', border: '1px solid #f0f0f0' }} />
              </div>
              <div style={{ padding: '12px 24px', borderTop: '1px solid #f0f0f0', background: '#fafafa', textAlign: 'center' }}>
                <GlobalOutlined style={{ fontSize: 12, color: '#8c8c8c', marginRight: 6 }} />
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>出自腾讯频道 / 众生之门社区</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
