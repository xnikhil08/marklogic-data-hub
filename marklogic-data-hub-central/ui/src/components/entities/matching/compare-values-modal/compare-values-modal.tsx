import React from "react";
import {Modal} from "antd";
import "./compare-values-modal.scss";
import styles from "./compare-values-modal.module.scss";
import {MLTable} from "@marklogic/design-system";
import matchIcon from "../../../../assets/matchIcon.png";
import {Definition} from "../../../../types/modeling-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import arrayIcon from "../../../../assets/icon_array.png";

interface Props {
   isVisible: any;
   toggleModal: (isVisible: boolean) => void;
   previewMatchActivity: any;
   uriInfo: any;
   activeStepDetails: any;
   entityProperties:any;
   uriCompared:any;
   entityDefinitionsArray:any;
}

const CompareValuesModal: React.FC<Props> = (props) => {
  let counter=0;
  let info1, info2;
  let property1, property2;
  let matchedProperties = [""];

  const DEFAULT_ENTITY_DEFINITION: Definition = {
    name: "",
    properties: []
  };

  const closeModal = () => {
    props.toggleModal(false);
  };

  const getPropertyPath = (parentKeys: any, propertyName: string) => {
    let propertyPath = "";
    parentKeys.forEach(el => !propertyPath.length ? propertyPath = el.split(",")[0] : propertyPath = propertyPath + "." + el.split(",")[0]);
    propertyPath = propertyPath + "." + propertyName;
    return propertyPath;
  };

  const parseDefinitionsToTable = (entityDefinitionsArray: Definition[]) => {
    let entityTypeDefinition: Definition = entityDefinitionsArray.find(definition => definition.name === props.activeStepDetails.entityName) || DEFAULT_ENTITY_DEFINITION;
    return entityTypeDefinition?.properties.map((property, index) => {
      let propertyRow: any = {};
      let counter = 0;
      let uriPropertyValue1="";
      let uriPropertyValue2="";
      if (property.datatype === "structured") {
        const parseStructuredProperty = (entityDefinitionsArray, property, parentDefinitionName, parentKey, parentKeys) => {
          let parsedRef = property.ref.split("/");
          if (parentKey) {
            parentKeys.push(parentKey);
          } else {
            parentKeys.push(property.name + "," + index + (counter+1));
          }
          if (parsedRef.length > 0 && parsedRef[1] === "definitions") {
            let structuredType = entityDefinitionsArray.find(entity => entity.name === parsedRef[2]);
            let structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
              if (structProperty.datatype === "structured") {
                // Recursion to handle nested structured types
                counter++;
                let parentDefinitionName = structuredType.name;
                let immediateParentKey = (parentKey !== "" ? property.name : structProperty.name) + "," + index + counter;
                return parseStructuredProperty(entityDefinitionsArray, structProperty, parentDefinitionName, immediateParentKey, parentKeys);
              } else {
                let parentKeysArray = [...parentKeys];
                // console.log("structProperty ",structProperty)
                return {
                  key: property.name + "," + index + structIndex + counter,
                  // property1: {uriPropertyValue1: uriPropertyValue1, properties: structProperty},
                  structured: structuredType.name,
                  propertyName: structProperty.name,
                  propertyPath: getPropertyPath(parentKeysArray, structProperty.name),
                  type: structProperty.datatype === "structured" ? structProperty.ref.split("/").pop() : structProperty.datatype,
                  multiple: structProperty.multiple ? structProperty.name : "",
                  hasChildren: false,
                  hasParent: true,
                  parentKeys: parentKeysArray
                };
              }
            });

            let hasParent = parentKey !== "";
            let parentKeysArray = [...parentKeys];
            return {
              key: property.name + "," + index + counter,
              structured: structuredType.name,
              property: {uriPropertyValue1: uriPropertyValue1, properties: property},
              propertyName: property.name,
              propertyPath: hasParent ? getPropertyPath(parentKeysArray, property.name) : property.name,
              multiple: property.multiple ? property.name : "",
              type: property.ref.split("/").pop(),
              children: structuredTypeProperties,
              hasChildren: true,
              hasParent: hasParent,
              parentKeys: hasParent ? parentKeysArray : []
            };
          }
        };
        propertyRow = parseStructuredProperty(entityDefinitionsArray, property, "", "", []);
        counter++;
      } else {
        // To handle non structured properties
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
        if (props.uriInfo !== undefined) {
          info1 = props.uriInfo[0].result1.data.data.envelope.instance;
          property1=info1[props.activeStepDetails.entityName];
          info2 = props.uriInfo[1].result2.data.data.envelope.instance;
          property2=info2[props.activeStepDetails.entityName];
          uriPropertyValue1 = property1[property.name];
          uriPropertyValue2 = property2[property.name];
          console.log("uriPropertyValue1 ", uriPropertyValue1);
          console.log("uriPropertyValue2 ", uriPropertyValue2);
          if (uriPropertyValue1 === undefined ||  uriPropertyValue2 === undefined) {
            uriPropertyValue1="";
            uriPropertyValue2="";
          }
        }

        // console.log("uriPropertyValue1 ",uriPropertyValue1)
        propertyRow = {
          key: property.name + "," + index,
          property: {uriPropertyValue1: uriPropertyValue1, uriPropertyValue2: uriPropertyValue2, properties: property},
          propertyName: property.name,
          propertyPath: property.name,
          type: property.datatype,
          identifier: entityTypeDefinition?.primaryKey === property.name ? property.name : "",
          multiple: property.multiple ? property.name : "",
          hasChildren: false,
          parentKeys: []
        };
      }
      return propertyRow;
    });
  };

  const columns = [
    {
      dataIndex: "propertyName",
      key: "propertyPath",
      width: "20%",
      ellipsis: true,
      render: (text, row) => {
        return {
          props: {
            style: {background: matchedProperties.includes(text) ? "#39944D" : ""}
          },
          children: <span className={row.hasOwnProperty("children") ? styles.nameColumnStyle : ""}>{text}</span>
        };
      }
    },
    {
      dataIndex: "property",
      key: "property.uriPropertyValue1",
      width: "40%",
      ellipsis: true,
      render: (property, key) => {
        return {
          props: {
            style: {background: matchedProperties.includes(property.properties.name) ? "#39944D" : ""}
          },
          children: <span key={key}>{property.uriPropertyValue1}</span>
        };
      }
    },
    {
      dataIndex: "property",
      key: "property.uriPropertyValue2",
      width: "40%",
      ellipsis: true,
      render: (property, key) => {
        return {
          props: {
            style: {background: matchedProperties.includes(property.properties.name) ? "#39944D" : ""}
          },
          children: <span key={key}>{property.uriPropertyValue2}</span>
        };
      }
    },
  ];
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
    <div><div className={styles.compareValuesModalHeading}>Compare</div>
      <div>
        <span className={styles.customer1}>Customer 1</span>
        <span className={styles.customer2}>Customer 2</span>
      </div>
      <div className={styles.compareTableHeader}>
        <span className={styles.uri1}>{props.uriCompared[0]}</span>
        <span className={styles.uri2}>{props.uriCompared[1]}</span>
      </div>
      <span><img src={matchIcon} className={styles.matchIcon}></img></span>
      <span className={styles.matchIconText}>Match</span>
    </div>
    <MLTable
      dataSource={parseDefinitionsToTable(props.entityDefinitionsArray)}
      className={styles.compareValuesTable}
      columns={columns}
      rowKey="key"
      id="compareValuesTable"
    >
    </MLTable>
  </Modal>;
};

export default CompareValuesModal;
