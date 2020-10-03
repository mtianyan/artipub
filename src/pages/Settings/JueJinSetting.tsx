import {Form, Select} from "antd";
import React from "react";

const provinceData = ['开发语言', '前端开发'];
const cityData = {
  开发语言: ['java', 'Python', 'C++'],
  前端开发: ['html', 'css'],
};

const JuejinSetting = <Form>
  <Form.Item
    label="文章分类"
    name="footer"
    rules={[{required: true, message: '请选择一个文章分类'}]}
  >
    <Select
      defaultValue={provinceData[0]}
      style={{minWidth: 120}}
      // onChange={handleProvinceChange}
    >
      {provinceData.map(province => (
        <Option key={province}>{province}</Option>
      ))}
    </Select>
  </Form.Item>
  <Form.Item
    label="文章标签"
    name="footer"
    rules={[{required: true, message: '请选择一个文章标签'}]}
  >
    <Select
      mode="multiple"
      defaultValue={provinceData[0]}
      style={{minWidth: 120}}
      // onChange={handleProvinceChange}
    >
      {provinceData.map(province => (
        <Option key={province}>{province}</Option>
      ))}
    </Select>
  </Form.Item>
</Form>;
export default JuejinSetting;
