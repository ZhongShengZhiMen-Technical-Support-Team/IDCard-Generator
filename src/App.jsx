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
  Cascader,
  Select
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
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PictureOutlined,
  LinkOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  PlusOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;

// 照片参数
const PHOTO_X = 70;
const PHOTO_Y = 160;
const PHOTO_WIDTH = 220;
const PHOTO_HEIGHT = 275;

// 能力选项数据
const abilityOptions = [
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
    label: '造物系',
  },
  {
    value: '生灵系',
    label: '生灵系',
  },
  {
    value: '心灵系',
    label: '心灵系',
  },
  {
    value: '强化系',
    label: '强化系',
  },
  {
    value: '变化系',
    label: '变化系',
  },
  {
    value: '特质系',
    label: '特质系',
  },
];

function App() {
  const [form] = Form.useForm();
  const canvasRef = useRef(null);
  const [currentBg, setCurrentBg] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);
  const [selectedAbilities, setSelectedAbilities] = useState([]);

  // 绘制圆角矩形路径
  const roundRect = useCallback((ctx, x, y, w, h, r) => {
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

  const drawWatermark = useCallback((ctx) => {
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
    // ctx.fillText('众', CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 - 30);
    // ctx.fillText('生', CANVAS_WIDTH / 2 - 30, CANVAS_HEIGHT / 2 - 30);
    // ctx.fillText('之', CANVAS_WIDTH / 2 + 20, CANVAS_HEIGHT / 2 - 30);
    // ctx.fillText('门', CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT / 2 - 30);

    // ctx.font = 'bold 16px "Segoe UI"';
    // ctx.fillStyle = 'rgba(100, 160, 80, 0.18)';
    // ctx.fillText('THE GATE OF ALL BEINGS', CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2 + 20);

    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(150, 200, 100, ${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 2, 2);
    }
  }, []);

  const drawMultilineText = useCallback((ctx, text, x, y, lineHeight) => {
    if (!text) return y;
    const lines = text.split(/\r?\n/);
    let currentY = y;
    for (let line of lines) {
      if (line.trim() === '' && lines.length > 1) {
        currentY += lineHeight * 0.5;
        continue;
      }
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  }, []);

  // 绘制照片
  const drawPhoto = useCallback((ctx) => {
    const radius = 8;
    ctx.save();

    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    roundRect(ctx, PHOTO_X - 4, PHOTO_Y - 4, PHOTO_WIDTH + 8, PHOTO_HEIGHT + 8, radius + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (photoImage) {
      roundRect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
      ctx.save();
      ctx.clip();

      const imgRatio = photoImage.width / photoImage.height;
      const boxRatio = PHOTO_WIDTH / PHOTO_HEIGHT;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > boxRatio) {
        drawHeight = PHOTO_HEIGHT;
        drawWidth = PHOTO_HEIGHT * imgRatio;
        drawX = PHOTO_X - (drawWidth - PHOTO_WIDTH) / 2;
        drawY = PHOTO_Y;
      } else {
        drawWidth = PHOTO_WIDTH;
        drawHeight = PHOTO_WIDTH / imgRatio;
        drawX = PHOTO_X;
        drawY = PHOTO_Y - (drawHeight - PHOTO_HEIGHT) / 2;
      }

      ctx.drawImage(photoImage, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    } else {
      roundRect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
      ctx.fillStyle = '#e8e8e8';
      ctx.fill();
      ctx.fillStyle = '#8c8c8c';
      ctx.font = '12px "Segoe UI", "Microsoft YaHei"';
      ctx.textAlign = 'center';
      ctx.fillText('证件照片', PHOTO_X + PHOTO_WIDTH / 2, PHOTO_Y + PHOTO_HEIGHT / 2 + 50);
      ctx.textAlign = 'start';
    }

    roundRect(ctx, PHOTO_X, PHOTO_Y, PHOTO_WIDTH, PHOTO_HEIGHT, radius);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }, [photoImage, roundRect]);

  // 格式化能力文本用于画布显示
  const formatAbilityText = useCallback((abilities) => {
    if (!abilities || abilities.length === 0) return '';
    
    return abilities.map(ability => {
      if (Array.isArray(ability) && ability.length > 0) {
        // 处理级联选择的值：[系别, 具体能力]
        if (ability.length >= 2) {
          return `${ability[0]}·${ability[1]}`;
        }
        return ability[0];
      }
      return ability;
    }).join('\n');
  }, []);

  const drawCard = useCallback((ctx) => {
    const values = form.getFieldsValue();
    const {
      name = '',
      race = '',
      guild = '',
      position = '',
      certNumber = ''
    } = values;

    let issueDate = '';
    if (values.issueDate) {
      if (typeof values.issueDate === 'object' && values.issueDate.format) {
        issueDate = values.issueDate.format('YYYY-MM');
      } else if (values.issueDate instanceof Date) {
        const d = values.issueDate;
        issueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        issueDate = String(values.issueDate);
      }
    }

    const lineageText = formatAbilityText(selectedAbilities);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentBg) {
      ctx.drawImage(currentBg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, '#e9f0e6');
      grad.addColorStop(1, '#cfdbc8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawWatermark(ctx);

    ctx.font = 'bold 40px "Times New Roman", "思源黑体"';
    ctx.fillStyle = '#3b5c2a';
    ctx.fillText('苍 南 会 馆', 38, 70);
    ctx.font = 'italic 18px "Segoe UI"';
    ctx.fillStyle = '#5e7c48';
    ctx.fillText('CANGNAN GUILD', 42, 105);

    drawPhoto(ctx);
    const startX = 420;
    let currentY = 165;
    const labelFont = 'bold 20px "Segoe UI", "PingFang SC"';
    const valueFont = 'bold 26px "Segoe UI", "Microsoft YaHei"';
    const smallGap = 68;

    ctx.font = labelFont;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('姓名 / Name', startX, currentY);
    ctx.font = valueFont;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(name || '—', startX, currentY + 38);
    currentY += smallGap;

    ctx.font = labelFont;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('种族 / Race', startX, currentY);
    ctx.fillText('隶属会馆 / Guild', startX + 260, currentY);
    ctx.font = valueFont;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(race || '—', startX, currentY + 38);
    ctx.fillText(guild || '—', startX + 260, currentY + 38);
    currentY += smallGap;

    ctx.font = labelFont;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('工作 / Work', startX, currentY);
    ctx.fillText('签发日期 / Date', startX + 260, currentY);
    ctx.font = valueFont;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(position || '—', startX, currentY + 38);
    ctx.fillText(issueDate || '—', startX + 260, currentY + 38);
    currentY += smallGap;

    ctx.font = labelFont;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('能力 / Lineage', startX, currentY);
    ctx.fillText('签发机关 / Authority', startX + 260, currentY);
    ctx.font = valueFont;
    ctx.fillStyle = '#1a3a28';
    const abilityEndY = drawMultilineText(ctx, lineageText || '—', startX, currentY + 38, 36);
    ctx.fillText('妖灵会馆总会馆', startX + 260, currentY + 38);
    currentY = Math.max(abilityEndY + 25, currentY + 70);

    ctx.font = labelFont;
    ctx.fillStyle = '#1a3a28';
    ctx.fillText(`编号 / Number`, startX - 385, CANVAS_HEIGHT - 110);
    ctx.font = valueFont;
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText(`${certNumber || 'LXXIII'}`, startX - 385, CANVAS_HEIGHT - 80);
    ctx.font = 'italic 20px "楷体", "KaiTi"';
    ctx.fillStyle = '#1a3a28';
    ctx.fillText('', CANVAS_WIDTH - 110, CANVAS_HEIGHT - 80);

  }, [form, currentBg, photoImage, selectedAbilities, drawWatermark, drawMultilineText, drawPhoto, formatAbilityText]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawCard(ctx);
  }, [drawCard]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const handleFormChange = useCallback(() => {
    initCanvas();
  }, [initCanvas]);

  const handleAddAbility = useCallback(() => {
    setSelectedAbilities(prev => [...prev, null]);
  }, []);

  const handleAbilityChange = useCallback((index, value) => {
    setSelectedAbilities(prev => {
      const newAbilities = [...prev];
      newAbilities[index] = value;
      return newAbilities;
    });
  }, []);

  const handleRemoveAbility = useCallback((index) => {
    setSelectedAbilities(prev => {
      const newAbilities = prev.filter((_, i) => i !== index);
      return newAbilities;
    });
    setTimeout(() => initCanvas(), 50);
  }, [initCanvas]);

  useEffect(() => {
    initCanvas();
  }, [selectedAbilities, initCanvas]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      message.error('画布未加载');
      return;
    }
    const values = form.getFieldsValue();
    const fileName = `Cangnan_${values.name || 'card'}.png`;
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
    message.success('证件已保存');
  }, [form]);

  const loadBgFromUrl = useCallback((url) => {
    if (!url) {
      setCurrentBg(null);
      setTimeout(() => initCanvas(), 50);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setCurrentBg(img);
      setTimeout(() => initCanvas(), 50);
    };
    img.onerror = () => {
      setCurrentBg(null);
      message.warning('背景图片加载失败，已切换为纯色背景');
      setTimeout(() => initCanvas(), 50);
    };
    img.src = url;
  }, [initCanvas]);

  const handleBgUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCurrentBg(img);
        form.setFieldsValue({ bgUrl: e.target.result });
        setTimeout(() => initCanvas(), 50);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  }, [form, initCanvas]);

  const handlePhotoUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setPhotoImage(img);
        message.success('照片已上传');
        setTimeout(() => initCanvas(), 50);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  }, [initCanvas]);

  const handleRemovePhoto = useCallback(() => {
    setPhotoImage(null);
    message.info('照片已移除');
    setTimeout(() => initCanvas(), 50);
  }, [initCanvas]);

  
  
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
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <IdcardOutlined style={{ fontSize: 26, color: '#3e8868' }} />
            <span style={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a' }}>
              会馆证件生成器
            </span>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          {/* 左侧表单 */}
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
                  会馆档案
                </span>
              </div>

              <div style={{ padding: 24 }}>
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handleFormChange}
                  initialValues={{
                    name: '罗小黑',
                    race: '妖精',
                    guild: '苍南会馆',
                    position: '普通居民',
                    issueDate: dayjs('2025-05', 'YYYY-MM'),
                    certNumber: 'LXXIII',
                    bgUrl: ''
                  }}
                  style={{ marginBottom: 0 }}
                >
                  {/* 证件照片上传 */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <CameraOutlined style={{ fontSize: 14, color: '#595959' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>
                        证件照片
                      </span>
                      <Tag style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>可选</Tag>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Upload
                        beforeUpload={handlePhotoUpload}
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
                          {photoImage ? '更换照片' : '上传照片'}
                        </Button>
                      </Upload>

                      {photoImage && (
                        <Button
                          danger
                          onClick={handleRemovePhoto}
                          style={{ borderRadius: 6 }}
                        >
                          移除照片
                        </Button>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={
                        <span><UserOutlined style={{ marginRight: 4 }} />姓名</span>
                      } name="name">
                        <Input placeholder="罗小黑" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={
                        <span><TeamOutlined style={{ marginRight: 4 }} />种族</span>
                      } name="race">
                        <Input placeholder="妖精" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={
                        <span><BankOutlined style={{ marginRight: 4 }} />隶属会馆</span>
                      } name="guild">
                        <Input placeholder="苍南会馆" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={
                        <span><ExperimentOutlined style={{ marginRight: 4 }} />工作</span>
                      } name="position">
                        <Input placeholder="普通居民" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={
                        <span><CalendarOutlined style={{ marginRight: 4 }} />签发日期</span>
                      } name="issueDate">
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
                        <span><NumberOutlined style={{ marginRight: 4 }} />证件编号</span>
                      } name="certNumber">
                        <Input placeholder="LXXIII" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* 能力选择 */}
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
                          能力
                        </span>
                      </div>
                    </div>

                    {selectedAbilities.map((ability, index) => (
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
                        <Cascader
                          value={ability}
                          onChange={(value) => handleAbilityChange(index, value)}
                          options={abilityOptions}
                          placeholder="选择能力系别"
                          style={{ flex: 1, borderRadius: 6 }}
                          allowClear={false}
                          changeOnSelect
                          expandTrigger="hover"
                          displayRender={(labels) => {
                            if (labels.length === 1) return labels[0];
                            return labels.join(' · ');
                          }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleRemoveAbility(index)}
                          style={{ borderRadius: 6 }}
                          size="small"
                        />
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      onClick={handleAddAbility}
                      block
                      icon={<PlusOutlined />}
                      style={{
                        borderRadius: 6,
                        height: 36,
                        borderColor: '#d9d9d9',
                        color: '#595959',
                        marginTop: selectedAbilities.length > 0 ? 4 : 0
                      }}
                    >
                      添加能力
                    </Button>
                  </div>

                  <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <PictureOutlined style={{ fontSize: 14, color: '#595959' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>
                        底图设置
                      </span>
                      <Tag style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>可选</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                      支持输入图片URL或上传本地文件
                    </div>

                    <Form.Item name="bgUrl" style={{ marginBottom: 12 }}>
                      <Input
                        prefix={<LinkOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="输入图片URL地址"
                        style={{ borderRadius: 6 }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            loadBgFromUrl(e.target.value);
                          }
                        }}
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 24 }}>
                      <Upload
                        beforeUpload={handleBgUpload}
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
                          本地上传
                        </Button>
                      </Upload>
                    </Form.Item>
                  </div>

                  <Space direction="vertical" style={{ width: '100%' }} size={10}>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={initCanvas}
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
                      刷新证件
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      block
                      style={{
                        borderRadius: 6,
                        height: 40,
                        fontSize: 14,
                        borderColor: '#d9d9d9'
                      }}
                    >
                      保存图片
                    </Button>
                  </Space>
                </Form>
              </div>
            </Card>
          </Col>

          {/* 右侧预览 */}
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
                  预览
                </span>
              </div>

              <div style={{ padding: 16, background: '#fafaf9' }}>
                <canvas
                  ref={canvasRef}
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
                <GlobalOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                  出自腾讯频道 / 众生之门社区
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;