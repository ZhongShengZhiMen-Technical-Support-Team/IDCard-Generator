import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
];

function LangSelect() {
  const { i18n } = useTranslation();
  
  const handleChange = (value) => {
    i18n.changeLanguage(value);
  };
  
  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      style={{ width: 140 }}
      options={languages}
      prefix={<GlobalOutlined />}
      bordered={false}
      dropdownStyle={{ minWidth: 140 }}
    />
  );
}

export default LangSelect;