import React, { useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { create } from 'ipfs-http-client';
import { useContract } from '../hooks/useContract';
import DepinterestABI from '../../client/contract-build/contracts/Depinterest.json';
import UploadButton from '../static/upload-button.png';

const client = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

export const StyledDiv = styled.div`
  position: fixed;
  z-index: 9999;
  border-radius: 50%;
  bottom: 20px;
  right: 10px;
  background: white;
`;

export const StyledImage = styled.img`
  border-radius: 50%;
  max-width: 75px;
  max-height: 75px;
`;

const FileUploadModal = ({ showModal, imagesAddress }) => {
  const inputRef = useRef(null);
  const descriptionRef = useRef(null);
  const [show, setShow] = useState(showModal);
  const contract = useContract(imagesAddress, DepinterestABI.abi);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = inputRef.current.files[0];
    if (!file) return;
    const desc = descriptionRef.current.value;
    try {
      await client.add(file).then((result) => {
        const url = `https://ipfs.infura.io/ipfs/${result.path}`;
        contract.uploadImage(url, desc);
      });
      handleClose();
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  };

  return (
    <>
      <StyledDiv>
        <StyledImage src={UploadButton} alt="" onClick={handleShow} />
      </StyledDiv>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Upload a file</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="imageFile">
              <input ref={inputRef} type="file" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Image description</Form.Label>
              <Form.Control as="textarea" rows={3} ref={descriptionRef} />
            </Form.Group>
            <Button type="submit">Upload</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FileUploadModal;
