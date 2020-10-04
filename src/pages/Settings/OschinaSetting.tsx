import {Checkbox, Col, Form, Row, Select} from "antd";
import React from "react";
const provinceData = ['开发语言', '前端开发'];

const OschinaSetting = (props) =>{
  const CategoryChildren = [];
  console.log(props.category)
  for (let i = 0; i < props.category.length; i++) {
    CategoryChildren.push(<Option key={i.toString()}>{props.category[i]}</Option>);
  }

  const publishZoneChildren = [];
  console.log(props.publishZone)
  for (let i = 0; i < props.publishZone.length; i++) {
    publishZoneChildren.push(<Option key={i.toString()}>{props.publishZone[i]}</Option>);
  }

  return <Form>
    <Form.Item
      label="文章分类:"
      name="category"
      rules={[{ required: true, message: '请选择一个文章分类:' }]}
    >
      <Select
        style={{ width: '100%' }}
        placeholder="请选择一个文章分类"
      >
        {CategoryChildren}
      </Select>
    </Form.Item>
    <Form.Item
      label="发布专区:"
      name="publishZone"
      rules={[{ required: true, message: '请选择一个发布专区' }]}
    >
      <Select
        mode="multiple"
        allowClear
        style={{ width: '100%' }}
        placeholder="请选择一个文章分类"
      >
        {publishZoneChildren}
      </Select>

    </Form.Item>
    <Form.Item
      label="高级设置"
      name="footer"
      rules={[{ required: true, message: '请输入文章分类:' }]}
    >
      <Checkbox.Group style={{ width: '100%' }} onChange={() => {}}>
        <Row>
          <Col span={4}>
            <Checkbox value="A">禁止评论</Checkbox>
          </Col>
          <Col span={4}>
            <Checkbox value="B">置顶</Checkbox>
          </Col>
        </Row>
      </Checkbox.Group>
    </Form.Item>
  </Form>
}
export default OschinaSetting
