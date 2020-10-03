import {Checkbox, Col, Form, Row, Select} from "antd";
import React from "react";
const provinceData = ['开发语言', '前端开发'];
const cityData = {
  开发语言: ['java', 'Python', 'C++'],
  前端开发: ['html', 'css'],
};
const OschinaSetting = <Form>
  <Form.Item
    label="文章分类:"
    name="footer"
    rules={[{ required: true, message: '请选择一个文章分类:' }]}
  >
    <Select
      defaultValue={provinceData[0]}
      style={{ minWidth: 120 }}
      // onChange={handleProvinceChange}
    >
      {provinceData.map(province => (
        <Option key={province}>{province}</Option>
      ))}
    </Select>
  </Form.Item>
  <Form.Item
    label="文章分类:"
    name="footer"
    rules={[{ required: true, message: '请选择一个文章分类:' }]}
  >
    <Select
      defaultValue={provinceData[0]}
      style={{ minWidth: 120 }}
      // onChange={handleProvinceChange}
    >
      {provinceData.map(province => (
        <Option key={province}>{province}</Option>
      ))}
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
export default OschinaSetting
