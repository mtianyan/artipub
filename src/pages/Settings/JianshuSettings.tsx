import {Form, Select} from "antd";
import React from "react";

const JianshuSettings = (props)=>{
  const CategoryChildren = [];
  console.log(props.category)
  for (let i = 0; i < props.category.length; i++) {
    CategoryChildren.push(<Option key={i.toString()}>{props.category[i].name}</Option>);
  }
  return <Form>
    <Form.Item
      label="文集"
      name="footer"
      rules={[{ required: true, message: '请选择一个文集' }]}
    >
      <Select
        style={{ minWidth: 120 }}
      >
        {CategoryChildren}
      </Select>
    </Form.Item>
  </Form>
}

export default JianshuSettings
