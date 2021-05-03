import React, {useState} from "react";
import {Modal, Table} from "antd";
import "./compare-values-modal.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./compare-values-modal.module.scss";
import {MLTable} from "@marklogic/design-system";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

interface Props {
   isVisible: any;
   toggleModal: (isVisible: boolean) => void;
   uriInfo: any;
   activeStepDetails: any;
   entityProperties:any;
   uriCompared:any;
}

const CompareValuesModal: React.FC<Props> = (props) => {
    let sampleData;
    let counter=0;
    const closeModal = () => {
        props.toggleModal(false);
    }

    const columns = [
        {
            title: 'URI1',
            dataIndex: 'name',
            key: 'name' + counter++,
                render: (name,key) => {
                    return <span key ={key}>{name} </span>
                }
        },
        // {
        //     title: 'URI2',
        //     dataIndex: 'property2',
        //     key: 'property2' + 'uris2' + counter++,
        //     render: (property2,key) => {
        //         return <span key ={key}>{property2.fname} </span>
        //     }
        // },
    ];

        if(props.uriInfo != undefined){
        console.log("uriInfo is ....",props.uriInfo);
        let info1, info2;
        let property1, property2;
        if(props.uriInfo[0].result1 !== undefined){
            info1 = props.uriInfo[0].result1.data.data.envelope.instance;
            property1=info1[props.activeStepDetails.entityName]
            console.log("property 1 ",property1)
        }
        if(props.uriInfo[1].result2 !== undefined){
            info2 = props.uriInfo[1].result2.data.data.envelope.instance;
            property2=info2[props.activeStepDetails.entityName]
        }
        let data = {
            property1: property1,
            property2: property2,
            properties: props.entityProperties,
            key: counter++,
        }
            sampleData = data;
            console.log("sampleData .....",sampleData); //props.uriInfo[0].result1.data.data.envelope
            console.log("urisCompared .....",props.uriCompared); //props.uriInfo[0].result1.data.data.envelope
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
          dataSource={props.entityProperties}
          columns={columns}
          rowKey="key"
          id="compareValuesTable"
        >
        </MLTable>
        </Modal>
};

export default CompareValuesModal;
