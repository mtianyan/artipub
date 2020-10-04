import {Checkbox, Col, Form, Row} from "antd";
import React from "react";

const ToutiaoSettings = (props)=>{
  return <Form>
    <Form.Item
      label="广告投放"
      name="footer"
      rules={[{ required: true, message: '请选择是否投放广告' }]}
    >
      <Checkbox.Group style={{ width: '100%' }} onChange={() => {}}>
        <Row>
          <Col span={4}>
            <Checkbox value="A">投放头条广告</Checkbox>
          </Col>
          <Col span={4}>
            <Checkbox value="B">不投放广告</Checkbox>
          </Col>
        </Row>
      </Checkbox.Group>
    </Form.Item>
  </Form>
}

export default ToutiaoSettings
