import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  Tag,
  DatePicker,
  Select,
  AutoComplete
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UploadOutlined,
  IdcardOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  NumberOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  PictureOutlined,
  LinkOutlined,
  CameraOutlined,
  GlobalOutlined,
  PlusOutlined,
  CloseOutlined,
  GithubOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

//@author: imsunxinhao
//@date: 2026/5/17
import { useTranslation } from 'react-i18next';
import './i18n.js';
import LangSelect from './compements/LangSelect.jsx';
import Link from 'antd/es/typography/Link.js';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;

const PHOTO_X = 70;
const PHOTO_Y = 160;
const PHOTO_WIDTH = 220;
const PHOTO_HEIGHT = 275;

const ability_options = [
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


function App() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const canvas_ref = useRef(null);
  const [current_bg, set_current_bg] = useState(null);
  const [photo_image, set_photo_image] = useState(null);
  const [selected_abilities, set_selected_abilities] = useState([]);

  const round_rect = useCallback((ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }, []);

  const draw_watermark = useCallback((ctx) => {
    const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    grad.addColorStop(0, 'rgba(180, 220, 150, 0.08)');
    grad.addColorStop(0.3, 'rgba(220, 240, 180, 0.15)');
    grad.addColorStop(0.5, 'rgba(200, 230, 160, 0.25)');
    grad.addColorStop(0.7, 'rgba(220, 240, 180, 0.15)');
    grad.addColorStop(1, 'rgba(180, 220, 150, 0.08)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = 'bold 28px "Segoe UI", "Microsoft YaHei"';
    ctx.fillStyle = 'rgba(100, 160, 80, 0.2)';

    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(150, 200, 100, ${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 2, 2);
    }
  }, []);

  const draw_multiline_text = useCallback((ctx, text, x, y, line_height) => {
    if (!text) return y;
    const lines = text.split(/\r?\n/);
    let current_y = y;
    for (let line of lines) {
      if (line.trim() === '' && lines.length > 1) {
        current_y += line_height * 0.5;
        continue;
      }
      ctx.fillText(line, x, current_y);
      current_y += line_height;
    }
    return current_y;
  }, []);

  const draw_photo = useCallback((ctx) => {
    const radius = 8;
    ctx.save();

    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    round_rect(ctx, PHOTO_X - 4, PHOTO_Y - 4, PHOTO_WIDTH + 8, PHOTO_HEIGHT + 8, radius + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (photo_image) {
      round_rect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
      ctx.save();
      ctx.clip();

      const img_ratio = photo_image.width / photo_image.height;
      const box_ratio = PHOTO_WIDTH / PHOTO_HEIGHT;

      let draw_width, draw_height, draw_x, draw_y;

      if (img_ratio > box_ratio) {
        draw_height = PHOTO_HEIGHT;
        draw_width = PHOTO_HEIGHT * img_ratio;
        draw_x = PHOTO_X - (draw_width - PHOTO_WIDTH) / 2;
        draw_y = PHOTO_Y;
      } else {
        draw_width = PHOTO_WIDTH;
        draw_height = PHOTO_WIDTH / img_ratio;
        draw_x = PHOTO_X;
        draw_y = PHOTO_Y - (draw_height - PHOTO_HEIGHT) / 2;
      }

      ctx.drawImage(photo_image, draw_x, draw_y, draw_width, draw_height);
      ctx.restore();
    } else {
      round_rect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
      ctx.fillStyle = '#e8e8e8';
      ctx.fill();
      ctx.fillStyle = '#8c8c8c';
      ctx.font = '12px "Segoe UI", "Microsoft YaHei"';
      ctx.textAlign = 'center';
      ctx.fillText('证件照片', PHOTO_X + PHOTO_WIDTH / 2, PHOTO_Y + PHOTO_HEIGHT / 2 + 50);
      ctx.textAlign = 'start';
    }

    round_rect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }, [photo_image, round_rect]);

  const format_ability_text = useCallback((abilities) => {
    if (!abilities || abilities.length === 0) return '';
    
    return abilities.map(ability => {
      if (Array.isArray(ability) && ability.length > 0) {
        if (ability.length >= 2 && ability[1]) {
          return `${ability[0]}·${ability[1]}`;
        }
        return ability[0];
      }
      return ability;
    }).join('\n');
  }, []);

  const draw_card = useCallback((ctx) => {
    const values = form.getFieldsValue();
    const {
      name = '',
      race = '',
      guild = '',
      position = '',
      cert_number = ''
    } = values;

    let issue_date = '';
    if (values.issue_date) {
      if (typeof values.issue_date === 'object' && values.issue_date.format) {
        issue_date = values.issue_date.format('YYYY-MM');
      } else if (values.issue_date instanceof Date) {
        const d = values.issue_date;
        issue_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        issue_date = String(values.issue_date);
      }
    }

    const lineage_text = format_ability_text(selected_abilities);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (current_bg) {
      ctx.drawImage(current_bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, '#e9f0e6');
      grad.addColorStop(1, '#cfdbc8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    draw_watermark(ctx);

    ctx.font = 'bold 40px "Times New Roman", "思源黑体"';
    ctx.fillStyle = '#3b5c2a';
    ctx.fillText('苍 南 会 馆', 38, 70);
    ctx.font = 'italic 18px "Segoe UI"';
    ctx.fillStyle = '#5e7c48';
    ctx.fillText('CANGNAN GUILD', 42, 105);

    draw_photo(ctx);
    const start_x = 420;
    let current_y = 165;
    const label_font = 'bold 20px "Segoe UI", "PingFang SC"';
    const value_font = 'bold 26px "Segoe UI", "Microsoft YaHei"';
    const small_gap = 68;

    ctx.font = label_font;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('姓名 / Name', start_x, current_y);
    ctx.font = value_font;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(name || '—', start_x, current_y + 38);
    current_y += small_gap;

    ctx.font = label_font;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('种族 / Race', start_x, current_y);
    ctx.fillText('隶属会馆 / Guild', start_x + 260, current_y);
    ctx.font = value_font;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(race || '—', start_x, current_y + 38);
    ctx.fillText(guild || '—', start_x + 260, current_y + 38);
    current_y += small_gap;

    ctx.font = label_font;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('工作 / Work', start_x, current_y);
    ctx.fillText('签发日期 / Date', start_x + 260, current_y);
    ctx.font = value_font;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(position || '—', start_x, current_y + 38);
    ctx.fillText(issue_date || '—', start_x + 260, current_y + 38);
    current_y += small_gap;

    ctx.font = label_font;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('能力 / Lineage', start_x, current_y);
    ctx.fillText('签发机关 / Authority', start_x + 260, current_y);
    ctx.font = value_font;
    ctx.fillStyle = '#1a3a28';
    const ability_end_y = draw_multiline_text(ctx, lineage_text || '—', start_x, current_y + 38, 36);
    ctx.fillText('妖灵会馆总会馆', start_x + 260, current_y + 38);
    current_y = Math.max(ability_end_y + 25, current_y + 70);

    ctx.font = label_font;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(`编号 / Number`, start_x - 385, CANVAS_HEIGHT - 110);
    ctx.font = value_font;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText(`${cert_number || 'LXXIII'}`, start_x - 385, CANVAS_HEIGHT - 80);
    ctx.font = 'italic 20px "楷体", "KaiTi"';
    ctx.fillStyle = '#1a3a28';
    ctx.fillText('', CANVAS_WIDTH - 110, CANVAS_HEIGHT - 80);

  }, [form, current_bg, photo_image, selected_abilities, draw_watermark, draw_multiline_text, draw_photo, format_ability_text]);

  const init_canvas = useCallback(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    draw_card(ctx);
  }, [draw_card]);

  useEffect(() => {
    init_canvas();
  }, [init_canvas]);

  const handle_form_change = useCallback(() => {
    init_canvas();
  }, [init_canvas]);

  const handle_add_ability = useCallback(() => {
    set_selected_abilities(prev => [...prev, null]);
  }, []);

  const handle_ability_change = useCallback((index, value) => {
    set_selected_abilities(prev => {
      const new_abilities = [...prev];
      new_abilities[index] = value;
      return new_abilities;
    });
  }, []);

  const handle_remove_ability = useCallback((index) => {
    set_selected_abilities(prev => {
      const new_abilities = prev.filter((_, i) => i !== index);
      return new_abilities;
    });
    setTimeout(() => init_canvas(), 50);
  }, [init_canvas]);

  useEffect(() => {
    init_canvas();
  }, [selected_abilities, init_canvas]);

  const handle_download = useCallback(() => {
    const canvas = canvas_ref.current;
    if (!canvas) {
      message.error(t('messages.canvas_not_loaded') || '证件生成失败');
      return;
    }
    const values = form.getFieldsValue();
    const file_name = `Cangnan_${values.name || 'card'}.png`;
    const link = document.createElement('a');
    link.download = file_name;
    link.href = canvas.toDataURL('image/png');
    link.click();
    message.success(t('messages.download_success') || '证件已保存');
  }, [form]);

  const load_bg_from_url = useCallback((url) => {
    if (!url) {
      set_current_bg(null);
      setTimeout(() => init_canvas(), 50);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      set_current_bg(img);
      setTimeout(() => init_canvas(), 50);
    };
    img.onerror = () => {
      set_current_bg(null);
      message.error(t('messages.bg_load_error') || '背景加载失败');
      setTimeout(() => init_canvas(), 50);
    };
    img.src = url;
  }, [init_canvas]);

  const handle_bg_upload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        set_current_bg(img);
        form.setFieldsValue({ bg_url: e.target.result });
        setTimeout(() => init_canvas(), 50);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  }, [form, init_canvas]);

  const handle_photo_upload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        set_photo_image(img);
        message.success(t('messages.upload_success') || '照片已上传');
        setTimeout(() => init_canvas(), 50);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  }, [init_canvas]);

  const handle_remove_photo = useCallback(() => {
    set_photo_image(null);
    message.success(t('messages.photo_removed') || '照片已移除');
    setTimeout(() => init_canvas(), 50);
  }, [init_canvas]);

  const get_all_ability_options = useCallback(() => {
    const options = [];
    ability_options.forEach(category => {
      if (category.children) {
        category.children.forEach(child => {
          if(category !== '') {
            options.push({
              value: child.value,
              label: `${category.label}·${child.label}`
            });
          }else{
            options.push({
              value:child.value,
              label:`${category.label}·${child.label}`
            })
          }
        });
      }
    });
    return options;
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 1200 }}>
        <div style={{ 
          position: 'absolute', 
          top: 20, 
          right: 20,
          zIndex: 1000 
        }}>
          <LangSelect />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <IdcardOutlined style={{ fontSize: 26, color: '#3e8868' }} />
            <span style={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a' }}>
              {t('information.pageName')}
            </span>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={10}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid #f0f0f0',
                overflow: 'hidden'
              }}
              styles={{ body: { padding: 0 } }}
            >
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fafafa'
              }}>
                <FileTextOutlined style={{ fontSize: 16, color: '#3e8868' }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                  {t('main.profile')}
                </span>
              </div>

              <div style={{ padding: 24 }}>
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handle_form_change}
                  initialValues={{
                    name: '罗小黑',
                    race: '妖精',
                    guild: '苍南会馆',
                    position: '普通居民',
                    issue_date: dayjs('2025-05', 'YYYY-MM'),
                    cert_number: 'LXXIII',
                    bg_url: ''
                  }}
                  style={{ marginBottom: 0 }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <CameraOutlined style={{ fontSize: 14, color: '#595959' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>
                        {t('main.picture')}
                      </span>
                      <Tag style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>{t('main.optional')}</Tag>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Upload
                        beforeUpload={handle_photo_upload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button
                          icon={<CameraOutlined />}
                          style={{
                            borderRadius: 6,
                            borderColor: '#d9d9d9'
                          }}
                        >
                          {photo_image ? t('actions.change-pic') : t('actions.upload')}
                        </Button>
                      </Upload>

                      {photo_image && (
                        <Button
                          danger
                          onClick={handle_remove_photo}
                          style={{ borderRadius: 6 }}
                        >
                          {t('actions.remove')}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={
                        <span><UserOutlined style={{ marginRight: 4 }} />{t('main.name')}</span>
                      } name="name">
                        <Input placeholder="罗小黑" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={
                        <span><TeamOutlined style={{ marginRight: 4 }} />{t('main.race')}</span>
                      } name="race">
                        <Input placeholder="妖精" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={
                        <span><BankOutlined style={{ marginRight: 4 }} />{t('main.guild')}</span>
                      } name="guild">
                        <Input placeholder="苍南会馆" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={
                        <span><ExperimentOutlined style={{ marginRight: 4 }} />{t('main.work')}</span>
                      } name="position">
                        <Input placeholder="普通居民" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={
                        <span><CalendarOutlined style={{ marginRight: 4 }} />{t('main.date')}</span>
                      } name="issue_date">
                        <DatePicker
                          picker="month"
                          format="YYYY-MM"
                          placeholder="选择日期"
                          style={{ width: '100%', borderRadius: 6 }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={
                        <span><NumberOutlined style={{ marginRight: 4 }} />{t('main.cert_number')}</span>
                      } name="cert_number">
                        <Input placeholder="LXXIII" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 10 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ThunderboltOutlined style={{ fontSize: 14, color: '#595959' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>
                          {t('main.lineage')}
                        </span>
                      </div>
                    </div>

                    {selected_abilities.map((ability, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'flex', 
                          gap: 8, 
                          alignItems: 'center',
                          marginBottom: 8,
                          padding: '8px 12px',
                          background: '#fafafa',
                          borderRadius: 8,
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <Select
                          value={ability ? ability[0] : undefined}
                          onChange={(value) => {
                            const current_ability = ability || [null, null];
                            handle_ability_change(index, [value, current_ability[1]]);
                          }}
                          placeholder="选择系别"
                          style={{ width: 130, borderRadius: 6 }}
                        >
                          {ability_options.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                        
                        <AutoComplete
                          value={ability ? ability[1] : undefined}
                          onChange={(value) => {
                            const current_ability = ability || [null, null];
                            handle_ability_change(index, [current_ability[0], value]);
                          }}
                          placeholder="输入或选择具体能力"
                          style={{ flex: 1, borderRadius: 6 }}
                          options={
                            ability && ability[0]
                              ? (ability_options.find(opt => opt.value === ability[0])?.children || []).map(child => ({
                                  value: child.value,
                                  label: child.label
                                }))
                              : get_all_ability_options()
                          }
                          allowClear
                          filterOption={(input_value, option) =>
                            option.value.toLowerCase().indexOf(input_value.toLowerCase()) !== -1
                          }
                        />
                        
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handle_remove_ability(index)}
                          style={{ borderRadius: 6 }}
                          size="small"
                        />
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      onClick={handle_add_ability}
                      block
                      icon={<PlusOutlined />}
                      style={{
                        borderRadius: 6,
                        height: 36,
                        borderColor: '#d9d9d9',
                        color: '#595959',
                        marginTop: selected_abilities.length > 0 ? 4 : 0
                      }}
                    >
                      {t('actions.add_lineage')}
                    </Button>
                  </div>

                  <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <PictureOutlined style={{ fontSize: 14, color: '#595959' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>
                        {t('main.bg')}
                      </span>
                      <Tag style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>{t('main.optional')}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                      {t('main.bg_desc')}
                    </div>

                    <Form.Item name="bg_url" style={{ marginBottom: 12 }}>
                      <Input
                        prefix={<LinkOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder={t('main.bg_placeholder')}
                        style={{ borderRadius: 6 }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            load_bg_from_url(e.target.value);
                          }
                        }}
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 24 }}>
                      <Upload
                        beforeUpload={handle_bg_upload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button
                          icon={<UploadOutlined />}
                          block
                          style={{
                            borderRadius: 6,
                            height: 36,
                            borderColor: '#d9d9d9'
                          }}
                        >
                          {t('main.bg_local_upload')}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </div>

                  <Space direction="vertical" style={{ width: '100%' }} size={10}>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={init_canvas}
                      block
                      style={{
                        background: '#3e8868',
                        borderColor: '#3e8868',
                        borderRadius: 6,
                        height: 40,
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      {t('actions.reload')}
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handle_download}
                      block
                      style={{
                        borderRadius: 6,
                        height: 40,
                        fontSize: 14,
                        borderColor: '#d9d9d9'
                      }}
                    >
                      {t('actions.download')}
                    </Button>
                  </Space>
                </Form>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid #f0f0f0',
                overflow: 'hidden'
              }}
              styles={{ body: { padding: 0 } }}
            >
              <div style={{
                padding: '14px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fafafa'
              }}>
                <EyeOutlined/>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>
                  {t('main.preview')}
                </span>
              </div>

              <div style={{ padding: 16, background: '#fafaf9' }}>
                <canvas
                  ref={canvas_ref}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 8,
                    display: 'block',
                    border: '1px solid #f0f0f0'
                  }}
                />
              </div>

              <div style={{
                padding: '12px 24px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#fafafa'
              }}>
                <GithubOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                <Link href={t('information.link')} target="_blank" style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {t('information.opensource')}
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;