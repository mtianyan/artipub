import {Col, Form, Input, Radio, Row, Select} from "antd";
import React from "react";

const CsdnSetting = (props) =>{
  const CategoryChildren = [];
  console.log(props.category)
  for (let i = 0; i < props.category.length; i++) {
    CategoryChildren.push(<Option key={i.toString()}>{props.category[i]}</Option>);
  }
  return <Form>
    <Form.Item
      required
  label="文章类型:"
  name="articleType"
  rules={[{ required: true, message: '请输入文章类型' }]}
  >
  <Radio.Group>
    <Radio value="a">原创</Radio>
    <Radio value="b">转载</Radio>
    <Radio value="c">翻译</Radio>
    </Radio.Group>
    </Form.Item>
    <Form.Item
  required
  label="原文地址:"
  name="footer"
  rules={[{ required: true, message: '请输入原文地址:' }]}
  >
  <Input placeholder="请输入原文地址"/>
    </Form.Item>
    <Form.Item
  required
  label="发布形式:"
  name="articleType"
  rules={[{ required: true, message: '请选择发布形式' }]}
  >
  <Radio.Group>
    <Radio value="a">公开</Radio>
    <Radio value="b">私密</Radio>
    <Radio value="c">粉丝可见</Radio>
    <Radio value="c">Vip可见</Radio>
    </Radio.Group>
    </Form.Item>
    <Form.Item
  required
  label="个人分类:"
  name="footer"
  rules={[{ required: true, message: '请输入个人分类:' }]}
  >
  <Row>
  <Select
  style={{ minWidth: 120 }}
    >
    {CategoryChildren}
    </Select>

  </Row>


  </Form.Item>
  <Form.Item
  required
  label="文章标签"
  name="footer"
  rules={[{ required: true, message: '' }]}
  >
    {/*TODO 仿照csdn的标签选择器*/}
    <Select
      style={{ minWidth: 120 }}
    >
      {CategoryChildren}
    </Select>
    </Form.Item>
    </Form>
}

export default CsdnSetting;
