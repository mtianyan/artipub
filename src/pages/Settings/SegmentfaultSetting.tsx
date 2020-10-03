import {Col, Form, Input, Radio, Row, Select} from "antd";
import React from "react";
const provinceData = ['开发语言', '前端开发'];
const cityData = {
  开发语言: ['java', 'Python', 'C++'],
  前端开发: ['html', 'css'],
};

const SegmentfaultSetting = <Form>
  <Form.Item
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
    label="原文地址:"
    name="footer"
    rules={[{ required: true, message: '请输入原文地址:' }]}
  >
    <Input />
  </Form.Item>
  <Form.Item
    label="文章分类:"
    name="footer"
    rules={[{ required: true, message: '请输入文章分类:' }]}
  >
    <Row>
      <Col span={12}>
        <Select
          defaultValue={provinceData[0]}
          style={{ minWidth: 120 }}
          // onChange={handleProvinceChange}
        >
          {provinceData.map(province => (
            <Option key={province}>{province}</Option>
          ))}
        </Select>
      </Col>
      <Col span={12}><Select
        style={{ paddingLeft: 10, minWidth: 120 }}
        // value={secondCity}
        // onChange={onSecondCityChange}
      >
        {/*{cities.map(city => (*/}
        {/*  <Option key={city}>{city}</Option>*/}
        {/*))}*/}
      </Select></Col>
    </Row>


  </Form.Item>
</Form>
export default SegmentfaultSetting
