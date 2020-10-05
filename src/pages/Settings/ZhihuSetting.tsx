import {Form, Input} from "antd";
import React from "react";

const provinceData = ['开发语言', '前端开发'];
const cityData = {
  开发语言: ['java', 'Python', 'C++'],
  前端开发: ['html', 'css'],
};
const ZhihuSetting = (props)=>{
  <Form>
    <Form.Item
      label="话题"
      name="footer"
      rules={[{required: true, message: '请输入话题'}]}
    >
      <Input />
    </Form.Item>
  </Form>;
}
export default ZhihuSetting
