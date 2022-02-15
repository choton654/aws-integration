import { useEffect, useState } from 'react'
import axios from "axios"
import { useDropzone } from 'react-dropzone'
import {
  Modal, ModalBody, ModalHeader, ModalFooter,
  Button, Form, FormGroup, Label, Input, DropdownItem,
  DropdownMenu, DropdownToggle,
  UncontrolledDropdown
} from 'reactstrap'
import Autocomplete from "react-autocomplete"
import './App.css'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner'
import { ToastContainer, toast } from 'react-toastify';
import { S3 as ClientS3 } from "@aws-sdk/client-s3"
// import { Upload } from "@aws-sdk/lib-storage"
import S3 from 'aws-sdk/clients/s3'
import { useEtherBalance, useEthers } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'


const RobloxForm = ({
  postItem,
  assetName,
  setAssetName,
  assetType,
  setAssetType,
  singleItem,
  setSingleItem,
  listOfFiles,
  setisRobloxUpload
}) => {
  return (
    <div style={{
      width: 300,
      marginLeft: 20,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid #bdbdbd",
      borderRadius: 20,
      boxShadow: "0px 2px 2px 0px #bdbdbd"
    }}>
      <Form onSubmit={postItem} style={{ margin: 0, width: "100%" }}>
        <FormGroup>
          <Label for="exampleEmail">
            Name of the asset
          </Label>
          <Input
            name="assetName"
            placeholder="with a placeholder"
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="exampleSelect">
            Select asset type
          </Label>
          <Input
            id="exampleSelect"
            name="select"
            type="select"
            value={assetType}
            onChange={(e) => setAssetType(parseInt(e.target.value))}
          >
            {[11, 12, 13].map((item, idx) =>
              <option key={idx}>
                {item}
              </option>
            )}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="exampleSelect">
            Select file to upload
          </Label>
          <Input
            id="exampleSelect"
            name="select"
            type="select"
            value={singleItem}
            onChange={(e) => setSingleItem(e.target.value)}>
            {listOfFiles.map((item, idx) =>
              <option key={idx}>
                {item.label}
              </option>
            )}
          </Input>
        </FormGroup>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <Button
            type='submit'
            disabled={listOfFiles.length === 0}>
            Deploy to Roblox
          </Button>
          <Button
            onClick={() => setisRobloxUpload(false)}
            color='danger'
            disabled={listOfFiles.length === 0}>
            Close
          </Button>
        </div>
      </Form>
    </div>
  )
}

const DclForm = ({ singleItem }) => {

  const labelParts = singleItem.split(".")
  const labelExt = labelParts[labelParts.length - 1]
  const objExt = ['glb', 'gltf', 'obj']
  const imgExt = ['png', 'jpeg', 'webp', 'gif']

  return (
    <div style={{
      marginTop: 10,
      marginBottom: 10,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid #bdbdbd",
      borderRadius: 20,
      boxShadow: "0px 2px 2px 0px #bdbdbd"
    }}>
      <div className='dropzone' style={{ width: 400, height: 350 }}>
        {objExt.includes(labelExt) ?
          <div>
            <model-viewer src={`/downloadFile/${singleItem}`}
              alt={singleItem}
              auto-rotate camera-controls ar ios-src={singleItem}>
            </model-viewer>
          </div> :
          imgExt.includes(labelExt) ?
            <img src={`/downloadFile/${singleItem}`} alt={singleItem}
            /> :
            <h6 style={{ color: "#424242" }}>No such model type found. Accepts only GLB, GLTF, OBJ types</h6>
        }
      </div>
    </div>
  )
}


const App = () => {

  const { activateBrowserWallet, account, deactivate, active } = useEthers()
  const etherBalance = useEtherBalance(account)
  // console.log(active);
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [listOfFiles, setListOfFiles] = useState([])
  const [singleItem, setSingleItem] = useState('')
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState(13)
  const [isRobloxUpload, setisRobloxUpload] = useState(false)

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: '.glb,.gltf,.obj,.fbx,.rbxm',
    onDrop: files => uploadFile(files[0])
  });

  // initialize s3 client
  const client = new ClientS3({
    region: process.env.REACT_APP_AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
    }
  })

  // upload file to s3 bucket
  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append("item", file)
    try {
      setLoading(true)
      const { data } = await axios.post("/uploadFile", formData)
      if (data.success) {
        setLoading(false)
        setListOfFiles([...listOfFiles, { label: file.name }])
        setSingleItem(file.name)
        setShowModal(false)
        toast.success('File successfuly uploaded', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.log(error);
      setLoading(false)
      setShowModal(false)
    }
  }

  // from reactapp to s3
  // const uploadFile = async (file) => {
  //   const params = {
  //     Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //     Key: file.name,
  //     Body: file
  //   }
  //   try {
  //     setLoading(true)
  //     // use lib/storage to upload file into smaller chuncks
  //     const parallelUploads3 = new Upload({ client, params });
  //     parallelUploads3.on("httpUploadProgress", (progress) => {
  //       console.log(progress);
  //     });
  //     await parallelUploads3.done();
  // setLoading(false)
  // setListOfFiles([...listOfFiles, { label: file.name }])
  // setSingleItem(file.name)
  // setShowModal(false)
  // toast.success('File successfuly uploaded', {
  //   position: "bottom-center",
  //   autoClose: 5000,
  //   hideProgressBar: false,
  //   closeOnClick: true,
  //   pauseOnHover: true,
  //   draggable: true,
  //   progress: undefined,
  // });
  //   } catch (error) {
  //     console.log(error);
  //     setLoading(false)
  //     setShowModal(false)
  //   }
  // }



  // download file from s3 bucket
  const downloadFile = async () => {
    const downloadParams = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: singleItem,
      Expires: 60
    }
    // initialize s3 to get signed url, client sdk doesn't support 'getSignedUrl' method.
    const s3 = new S3({
      region: process.env.REACT_APP_AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
      }
    })
    try {
      const url = s3.getSignedUrl('getObject', downloadParams)
      let link = document.createElement('a');
      link.href = url
      link.download = url
      link.click()
    } catch (error) {
      console.log(error);
    }
  }

  // get lists of bucket files
  const getListofFiles = async () => {
    try {
      const data = await client.listObjectsV2({ Bucket: process.env.REACT_APP_AWS_BUCKET_NAME })
      setListOfFiles(data.Contents.map((item) => { return { label: item.Key } }))
      setSingleItem(data.Contents[0].Key)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getListofFiles()
  }, [])

  // roblox upload
  const postItem = async (e) => {
    e.preventDefault()
    const formData = { assetName, assetType, assetPath: singleItem };
    // formData.append("item", item)
    try {
      const { status } = await axios.post('/uploadItem', formData, { headers: { 'Content-Type': 'application/json' } })
      if (status === 201) {
        toast.success('File successfuly uploaded to roblox', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error('File upload failed', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  const files = acceptedFiles.map(file => (
    <div key={file.path}>
      {file.path} - {file.size} bytes
    </div>
  ));

  useEffect(() => {
    if (active && account) {
      (async () => {
        const { data } = await axios.get(`/walletinfo/${account}`)
        // console.log(data?.item)
        if (data.item && data.item.wallet_id === account) {
          console.log('wallet exists');
        } else {
          (async () => {
            try {
              const { data } = await axios.post("/walletinfo", { wallet_address: account })
              if (data.message) {
                toast.success('Wallet successfully connected', {
                  position: "bottom-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              }
            } catch (error) {
              console.log(error);
            }
          })()
        }
      })()
    }
  }, [active, account])

  return (
    <div className='App'
      style={{
        flexDirection: window.innerWidth < 680 ? "column" : "row"
      }}
    >
      <div style={{
        // width: 350,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #bdbdbd",
        borderRadius: 20,
        boxShadow: "0px 2px 2px 0px #bdbdbd"
      }}>
        <Button
          style={{ width: 200 }}
          color="info"
          onClick={() => setShowModal(true)}
        >
          Upload
        </Button>
        <Modal isOpen={showModal} backdrop="static">
          <ModalHeader>
            Upload file
          </ModalHeader>
          <ModalBody>
            {loading ?
              <div className='loadingContainer'>
                <TailSpin color="#00BFFF" height={50} width={50} />
              </div>
              :
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p style={{ margin: 10 }}>Drag files to upload</p>
              </div>
            }
            <div style={{ marginTop: 15 }}>
              <h6 style={{ textAlign: "center" }}>Files you selected:</h6>
              <p style={{ textAlign: "center" }}>{files}</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
        <div style={{
          marginTop: 10, display: "flex",
          flexDirection: "column",
        }}>
          <h5>Choose file to download</h5>
          <Autocomplete
            getItemValue={(item) => item.label}
            items={listOfFiles}
            renderInput={(props) =>
              <input {...props} style={{
                backgroundColor: "#eeeeee", border: "none",
                paddingLeft: 5, paddingRight: 5, width: '90%'
              }}
              />}
            renderItem={(item, isHighlighted) =>
              <div style={{
                background: isHighlighted ? 'lightgray' : 'white',
                cursor: 'pointer'
              }}>
                <p style={{ textAlign: "center", fontWeight: '600', margin: 0 }}>
                  {item.label.slice(0, 20)}{item.label.length > 20 && '...'}{item.label.length > 20 &&
                    item.label.split('.')[item.label.split('.').length - 1]}
                </p>
              </div>
            }
            autoHighlight={true}
            value={listOfFiles.length > 0 ? singleItem : 'Loading...'}
            onChange={(e) => setSingleItem(e.target.value)}
            onSelect={(val) => setSingleItem(val)}
            menuStyle={{
              marginTop: 5,
              width: 200,
              borderRadius: '3px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
              background: '#eeeeee',
              padding: '2px 0',
              fontSize: '90%',
              position: 'fixed',
              overflow: 'auto',
              maxHeight: '50%',
              zIndex: 3
            }}
          />
          <DclForm
            singleItem={singleItem}
            uploadFile={uploadFile}
            loading={loading} />
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <UncontrolledDropdown style={{ marginTop: 10 }}>
              <DropdownToggle caret>
                {isRobloxUpload ? "Roblox" : "Deploy"}
              </DropdownToggle>
              <DropdownMenu container="body">
                <DropdownItem onClick={() => setisRobloxUpload(true)}>
                  Roblox
                </DropdownItem>
                <DropdownItem onClick={() => {
                  setisRobloxUpload(false)
                  window.open("https://builder.decentraland.org")
                }}>
                  Decentraland
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <Button
              disabled={listOfFiles.length === 0}
              onClick={downloadFile}
              style={{ marginTop: 10 }}>
              Download
            </Button>
          </div>
          {window.ethereum ?
            <div style={{ marginTop: 10, }}>
              <h6>Ethereum wallet {active ? "connected" : "detected"}</h6>
              {account && <h6>Account: <span style={{ marginLeft: 5, color: "royalblue" }}>{account}</span></h6>}
              {etherBalance && <h6>Balance: <span style={{ marginLeft: 5, color: "royalblue" }}>{formatEther(etherBalance)}</span></h6>}
              <div style={{
                display: "flex", flexDirection: "row",
                justifyContent: "space-around", width: "100%"
              }}>
                <Button
                  onClick={activateBrowserWallet}>
                  Connect Wallet
                </Button>
                <Button
                  onClick={deactivate}>
                  Disconnect Wallet
                </Button>
              </div>
            </div>
            :
            <div style={{ marginTop: 10 }}>
              <h6>Couldn't find any ethereum wallet.</h6>
              <h6>Please install
                <span style={{
                  color: "royalblue",
                  textDecorationLine: "underline",
                  marginLeft: 5,
                  cursor: "pointer"
                }}
                  onClick={() => window.open('https://metamask.io/download/')}>
                  metamask wallet</span></h6>
            </div>}
        </div>
      </div>
      {isRobloxUpload &&
        <RobloxForm
          postItem={postItem}
          assetName={assetName}
          setAssetName={setAssetName}
          assetType={assetType}
          setAssetType={setAssetType}
          singleItem={singleItem}
          setSingleItem={setSingleItem}
          listOfFiles={listOfFiles}
          setisRobloxUpload={setisRobloxUpload}
        />
      }
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;