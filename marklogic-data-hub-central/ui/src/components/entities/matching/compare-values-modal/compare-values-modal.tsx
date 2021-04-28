import React from "react";
import {Modal} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./compare-values-modal.module.scss";
import {MLTable} from "@marklogic/design-system";

interface Props {
   isVisible: any;
   toggleModal: (isVisible: boolean) => void;
}

const CompareValuesModal: React.FC<Props> = (props) => {
    const closeModal = () => {
        props.toggleModal(false);
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
        TestData </Modal>
};

export default CompareValuesModal;
