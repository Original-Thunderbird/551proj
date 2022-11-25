import React from 'react';
import Axios from 'axios';
import Container from './container.js';
import { MkdirForm, FilePartitionFrom } from './form.js';

export default function Explorer(props) {
  let fileReader, numPart;

  const [explorerState, setExplorerState] = React.useState({
      cmdErr: '', curDir: '/', cmdOutput: '', eList: '', fileContent: ''
  })

  const [cmdInput, setCmdInput] = React.useState({
    cdChildDir: '', catFile:'', rmTarget:''
  })

  const [cntnrVsblty, setCntnrVsblty] = React.useState({
    mkdirVsblty: false, putVsblty: false
  })

  React.useEffect(() => {
    console.log("init");
    Axios.post('http://localhost:3001/cmd', {cmd: 'ls', params: ['/']}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          eList: res.data.content
        }
      })
    });
  });

  function openMkdirPopup() {
    setCntnrVsblty(prevVsblty => {
      return {
        ...prevVsblty,
        mkdirVsblty: true
      }
    })
  }

  function closeMkdirPopup() {
    setCntnrVsblty(prevVsblty => {
      return {
        ...prevVsblty,
        mkdirVsblty: false
      }
    })
  }

  function openPutPopup() {
    setCntnrVsblty(prevVsblty => {
      return {
        ...prevVsblty,
        putVsblty: true
      }
    })
  }

  function closePutPopup() {
    setCntnrVsblty(prevVsblty => {
      return {
        ...prevVsblty,
        putVsblty: false
      }
    })
  }

  function cdParent(event) {
    Axios.post('http://localhost:3001/cmd', {cmd: 'cd', params: ['..']}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          curDir: res.data.content
        }
      })
    });
    Axios.post('http://localhost:3001/cmd', {cmd: 'ls', params: [explorerState.curDir]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          eList: res.data.content
        }
      })
    });
  }

  function cdChild(event) {
    event.preventDefault();
    Axios.post('http://localhost:3001/cmd', {cmd: 'cd', params: [cmdInput.cdChildDir]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          curDir: res.data.content
        }
      })
    });
    Axios.post('http://localhost:3001/cmd', {cmd: 'ls', params: [explorerState.curDir]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          eList: res.data.content
        }
      })
    });
  }

  function cat(event) {
    event.preventDefault();
    Axios.post('http://localhost:3001/cmd', {cmd: 'cat', params: [cmdInput.catFile]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          fileContent: res.data.content
        }
      })
    });
  }

  function mkdir(event) {
    event.preventDefault(event);
    console.log(event.target.name.value);
    closeMkdirPopup();
    Axios.post('http://localhost:3001/cmd', {cmd: 'mkdir', params: [event.target.name.value]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          curDir: res.data.content
        }
      })
    });
    Axios.post('http://localhost:3001/cmd', {cmd: 'ls', params: [explorerState.curDir]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          eList: res.data.content
        }
      })
    });
  }

  const put = (data) => {
    closePutPopup();
    numPart = data['partNum'];
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(data['file'][0]);
  }

  const handleFileRead = (e) => {
    Axios.post('http://localhost:3001/put', {file: JSON.parse(fileReader.result), numPart: numPart}).then((res) => {});
    Axios.post('http://localhost:3001/cmd', {cmd: 'ls'}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          eList: res.data.content
        }
      })
    });
  };

  // function handleClick() {
  //   console.log(inputRef);
  //   inputRef.current.click();
  // }

  // function handleFileChange(event) {
  //   const data = new FormData();
  //   var file = event.target.files[0];
  //   var fileName = event.target.files[0].name;
  //   console.log(file);
  //   console.log(fileName);
  //   data.append('file', file, fileName);
  //   console.log(data)
  // }

  function rm() {
    Axios.post('http://localhost:3001/cmd', {cmd: 'rm', params: [cmdInput.rmTarget]}).then((res) => {
    });
    Axios.post('http://localhost:3001/cmd', {cmd: 'ls', params: [explorerState.curDir]}).then((res) => {
      setExplorerState(prevExplorerState => {
        return {
          ...prevExplorerState,
          eList: res.data.content
        }
      })
    });
  }                         

  return (
      <div className="lvl1Section row">
        {
          /*
          <input
            style={{display: 'none'}}
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
          />
          <button onClick={handleClick}>Open file upload box</button>
          */
        }
        <div className="column2">
          <button className="btn btn-danger center" onClick={cdParent}>Go Back</button>
          {
            /** <button onClick={handleClick}>Upload File</button> */
          }
          <span>&nbsp; &nbsp; &nbsp;</span>
          <Container 
            triggerText='Upload File' 
            onSubmit={put} 
            form={FilePartitionFrom}
            setVisible={openPutPopup}
            setInvisible={closePutPopup}
            visibility={cntnrVsblty.putVsblty}
          />
          <span>&nbsp; &nbsp; &nbsp;</span>
          <Container 
            triggerText='Create Folder' 
            onSubmit={mkdir} 
            form={MkdirForm}
            setVisible={openMkdirPopup}
            setInvisible={closeMkdirPopup}
            visibility={cntnrVsblty.mkdirVsblty}
          />
          <br/>
          <label>Current dir:{explorerState.curDir}</label>
          <br/>
          <label>Content:{explorerState.eList}</label>
          <hr/>
          <br/>
          <form onSubmit={cdChild}>
            <label>Which folder you want to go? &nbsp; &nbsp; &nbsp;</label>
            <input 
              type="text"
              placeholder="target directory"
              onChange={props.inputCrtl}
              name="cdChildDir"
              value={cmdInput.cdChildDir}
            />
            <span>&nbsp; &nbsp; &nbsp;</span>
            <button className="btn btn-danger center">Submit</button>
          </form>
          <br/>
          <form onSubmit={cat}>
            <label>Which file you want to open? &nbsp; &nbsp; &nbsp;</label>
            <input 
              type="text"
              placeholder="target file"
              onChange={props.inputCrtl}
              name="catFile"
              value={cmdInput.catFile}
            />
            <span>&nbsp; &nbsp; &nbsp;</span>
            <button className="btn btn-danger center">Submit</button>
          </form>
          <br/>
          <form onSubmit={rm}>
            <label>Which file you want to delete? &nbsp; &nbsp; &nbsp;</label>
            <input 
              type="text"
              placeholder="target file"
              onChange={props.inputCrtl}
              name="rmTarget"
              value={cmdInput.rmTarget}
            />
            <span>&nbsp; &nbsp; &nbsp;</span>
            <button className="btn btn-danger center">Submit</button>
          </form>
        </div>
        <div className="column2">
          <label>File Content:{explorerState.fileContent}</label>
        </div>
      </div>
  )
}