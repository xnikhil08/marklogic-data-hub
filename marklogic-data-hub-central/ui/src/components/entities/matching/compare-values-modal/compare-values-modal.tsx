import React from "react";
import {Modal} from "antd";
import "./compare-values-modal.scss";
import styles from "./compare-values-modal.module.scss";
import {MLTable} from "@marklogic/design-system";

interface Props {
   isVisible: any;
   toggleModal: (isVisible: boolean) => void;
   previewMatchActivity: any;
   uriInfo: any;
   activeStepDetails: any;
   entityProperties:any;
   uriCompared:any;
}

const CompareValuesModal: React.FC<Props> = (props) => {
  let counter=0;
  let compareValuesData;
  let info1, info2;
  let property1, property2;
  let matchedProperties = [""];
  const closeModal = () => {
    props.toggleModal(false);
  };

  const columns = [
    {
      dataIndex: "properties",
      key: "name  " + counter++,
      width: "20%",
      render: (properties, key) => {
        return {
          props: {
            style: {background: matchedProperties.includes(properties.name) ? "#39944D" : ""}
          },
          children: <span key={key} className={matchedProperties.includes(properties.name) ? styles.matchedRow : ""}>{properties.name} </span>
        };
      }
    },
    {
      dataIndex: "property1",
      key: "property1" + "uris1" + counter++,
      render: (property1, key) => {
        return {
          props: {
            style: {background: matchedProperties.includes(property1.properties.name) ? "#39944d" : ""}
          },
          children: <span key={key}>{property1.uriPropertyValue1}</span>
        };
      }
    },
    {
      dataIndex: "property2",
      key: "property2" + "uris2" + counter++,
      render: (property2, key) => {
        return {
          props: {
            style: {background: matchedProperties.includes(property2.properties.name) ? "#39944D" : ""}
          },
          children: <span key={key}>{property2.uriPropertyValue2}</span>
        };
      }
    },
  ];

  if (props.entityProperties !== undefined && props.uriInfo !== undefined) {
    compareValuesData = props.entityProperties.map(property => {
      for (let i in props.previewMatchActivity.actionPreview) {
        let allUris = props.previewMatchActivity.actionPreview[i].uris;
        if (allUris.includes(props.uriCompared[0]) && allUris.includes(props.uriCompared[1])) {
          for (let j in props.previewMatchActivity.actionPreview[i].matchRulesets) {
            let matchRuleset = props.previewMatchActivity.actionPreview[i].matchRulesets[j];
            let name = matchRuleset.split(" - ");
            matchedProperties.push(name[0]);
          }
        }
      }
      info1 = props.uriInfo[0].result1.data.data.envelope.instance;
      property1=info1[props.activeStepDetails.entityName];
      info2 = props.uriInfo[1].result2.data.data.envelope.instance;
      property2=info2[props.activeStepDetails.entityName];
      let uriPropertyValue1="";
      let uriPropertyValue2="";
      if (property1[property.name] !== undefined) {
        uriPropertyValue1 = property1[property.name];
      }
      if (property2[property.name] !== undefined) {
        uriPropertyValue2 = property2[property.name];
      }
      let data = {
        property1: {uriPropertyValue1: uriPropertyValue1, properties: property},
        property2: {uriPropertyValue2: uriPropertyValue2, properties: property},
        properties: property,
        key: counter++,
      };
      return data;
    });

  }
  return <Modal
    visible={props.isVisible}
    closable={true}
    maskClosable={false}
    title={null}
    footer={null}
    width={1400}
    destroyOnClose={true}
    onCancel={closeModal}
    onOk={closeModal}
  >
    <div className={styles.compareValuesModalHeading}>Compare</div>
    <MLTable
      dataSource={compareValuesData}
      columns={columns}
      rowKey="key"
      id="compareValuesTable"
    >
    </MLTable>
  </Modal>;
};

export default CompareValuesModal;
