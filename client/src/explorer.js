import React from 'react';
import Axios from 'axios';
import Container from './container.js';
import { MkdirForm, FilePartitionFrom } from './form.js';

export default function Explorer() {
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
  }, []);

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

  function handleCmdChange(event) {
    setCmdInput(prevInput => {
      return {
        ...prevInput,
        [event.target.name]: event.target.value
      }
    })
  }

  function cdParent() {
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

  function cdChild() {
    if(cmdInput.cdChildDir === '') {
      alert('target directory cannot be empty');
    }
    else {
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
  }

  function cat() {
    if(cmdInput.catFile === '') {
      alert('file name cannot be empty');
    }
    else {
      Axios.post('http://localhost:3001/cmd', {cmd: 'cat', params: [cmdInput.catFile]}).then((res) => {
        setExplorerState(prevExplorerState => {
          return {
            ...prevExplorerState,
            fileContent: res.data.content
          }
        })
      });
    }
  }

  function mkdir(event) {
    if(event.target.name.value === "") {
      alert('please input folder name');
    }
    else {
      closeMkdirPopup();
      Axios.post('http://localhost:3001/cmd', {cmd: 'mkdir', params: [event.target.name.value]}).then((res) => {
        console.log(res.data);
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
  }

  const put = (data) => {
    if(data.file.length === 0) {
      alert('please select a file');
    }
    else if(data.partNum === '') {
      alert('please input number of partitions');
    }
    else {
      closePutPopup();
      numPart = data['partNum'];
      fileReader = new FileReader();
      fileReader.onloadend = handleFileRead;
      fileReader.readAsText(data['file'][0]);
    }
  }

  const handleFileRead = (event) => {
    event.preventDefault(event);
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

  function rm() {
    if(cmdInput.rmTarget === '') {
      alert('file name cannot be empty');
    }
    else {
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
  }                         

  return (
      <div className="lvl1Section row">
        <div className="column2">
          {explorerState.curDir !== '/' ? <button className="btn btn-danger center" onClick={cdParent}>Go Back</button> : null}
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
          <label>Current dir:&nbsp; &nbsp; {explorerState.curDir}</label>
          <br/>
          <label>Content:&nbsp; &nbsp; {explorerState.eList}</label>
          <hr/>
          <br/>
          <form onSubmit={cdChild}>
            <label>Which folder you want to go? &nbsp; &nbsp; &nbsp;</label>
            <input 
              type="text"
              placeholder="target directory"
              onChange={handleCmdChange}
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
              onChange={handleCmdChange}
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
              onChange={handleCmdChange}
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