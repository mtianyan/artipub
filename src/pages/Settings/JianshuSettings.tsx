import {Form, Select} from "antd";
import React from "react";

const JianshuSettings = (props)=>{

  return <Form>
    <Form.Item
      label="文集"
      name="footer"
      rules={[{ required: true, message: '请选择一个文集' }]}
    >
      <Select
        defaultValue={provinceData[0]}
        style={{ minWidth: 120 }}
        onChange={handleProvinceChange}
      >
        {provinceData.map(province => (
          <Option key={province}>{province}</Option>
        ))}
      </Select>
    </Form.Item>
  </Form>
}

export default JianshuSettings
