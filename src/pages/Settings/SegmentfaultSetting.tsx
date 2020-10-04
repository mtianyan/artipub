import {Col, Form, Input, Radio, Row, Select} from "antd";
import React, {useState} from "react";

const SegmentfaultSetting = (props) =>{

  const provinceData = props.bigCate
  const cityData = props.sonCate
  console.log(provinceData)
  console.log(cityData)
  const [cities, setCities] = useState(cityData[provinceData[0]]);
  const [secondCity, setSecondCity] = useState(cityData[provinceData[0]][0]);
  const handleProvinceChange = value => {
    setCities(cityData[value])
    setSecondCity(cityData[value][0])
  };
  const onSecondCityChange = value => {
    setSecondCity(value)
  };
  return <Form>
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
            onChange={handleProvinceChange}
          >
            {provinceData.map(province => (
              <Option key={province}>{province}</Option>
            ))}
          </Select>
        </Col>
        <Col span={12}><Select
          style={{ paddingLeft: 10, minWidth: 120 }}
          value={secondCity}
          onChange={onSecondCityChange}
        >
          {cities.map(city => (
            <Option key={city}>{city}</Option>
          ))}
        </Select></Col>
      </Row>


    </Form.Item>
  </Form>
}
export default SegmentfaultSetting
