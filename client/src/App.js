import React from 'react';
import Axios from 'axios'
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

function App() {
  var cmd = '', params = [], filename = ''

  const [myOutput, setMyOutput] = React.useState({
    cmdErr: '', queryErr: '', curDir: '/', cmdOutput: '', queryOutput: ''
  })

  const [myInput, setMyInput] = React.useState({
    cmdStr: '', query:''
  })

  function handleChange(event) {
    console.log(event.target.name, event.target.value)
    setMyInput(prevInput => {
      return {
        ...prevInput,
        [event.target.name]: event.target.value
      }
    })
  }

  function handleCmd(event) {
    event.preventDefault();
    [cmd, params, filename] = parseRawCmd(myInput.cmdStr);
    console.log('after parse:', 'cmd:', cmd, 'params', params, 'filename', filename);
    Axios.post('http://localhost:3001/cmd', {cmd: cmd, params: params, filename: filename}).then((res) => {
    console.log(res.data)
    setMyOutput(prevOutput => {
      return {
        ...prevOutput,
        cmdErr: res.data.err
      }
    })
    //cmdErr = res.data.err;
      if(cmd === 'cd') {
        setMyOutput(prevOutput => {
          return {
            ...prevOutput,
            curDir: res.data.content
          }
        })
        //curDir = res.data.content;
      }
      else {
        setMyOutput(prevOutput => {
          return {
            ...prevOutput,
            cmdOutput: res.data.content
          }
        })
        //cmdOutput = res.data.content;
      }
    });
    setMyInput({
      cmdStr: '', query:''
    });
  }

  function handleQuery(event) {
    event.preventDefault();
    Axios.post('http://localhost:3001/create', myInput).then(() => {
      console.log("success");
    })
    setMyInput({
      cmdStr: '', query:''
    })
  }

  function parseRawCmd(cmdLine) {
    var cmd, params, filename, words;
    words = cmdLine.split(' ');
    cmd = words[0]
    switch(cmd) {
      case 'put':
        filename = words[1]
        params = [words[2], words[3]];
        break;
      case 'readPartition':
        params = [words[1], words[2]];
        break;
      default:
        params = [words[1]];
        break;
    }
    return [cmd, params, filename]
  }

  return (
    <div>
      <label>Current dir:{myOutput.curDir}</label>
      <form onSubmit={handleCmd}>
        <label>cmd:     </label>
        <input 
          type="text"
          placeholder="cmd"
          onChange={handleChange}
          name="cmdStr"
          value={myInput.cmdStr}
        />
        <button>Submit</button>
        <label>{myOutput.cmdErr}</label>
        <br/>
        <label>outPut:{myOutput.cmdOutput}</label>
      </form>
      <br/>
      <form onSubmit={handleQuery}>
        <label>query:     </label>
        <input 
          type="text"
          placeholder="query"
          onChange={handleChange}
          name="query"
          value={myInput.query}
        />
        <button>Submit</button>
        <label>{myOutput.queryErr}</label>
        <br/>
        <label>outPut:{myOutput.queryOutput}</label>
      </form>
    </div>
    // <div>
    //   <form  className="form-group" onSubmit={handleSubmit}>
    //     <label>name:     </label>
    //     <input 
    //       type="text"
    //       placeholder="your name"
    //       onChange={handleChange}
    //       name="name"
    //       value={formData.name}
    //     />
    //     <label>age:     </label>
    //     <input 
    //       type="text"
    //       placeholder="your age"
    //       onChange={handleChange}
    //       name="age"
    //       value={formData.age}
    //     />
    //     <label>country:     </label>
    //     <input 
    //       type="text"
    //       placeholder="your country"
    //       onChange={handleChange}
    //       name="country"
    //       value={formData.country}
    //     />
    //     <button>Submit</button>
    //   </form>
    //   {/* <button className="btn btn-primary" onClick={getEmployees}>GetAll</button>
    //   {empList.map(e => {
    //     return <div>{e.name},{e.age},{e.country}</div>
    //   })} */}
    //   <form className="App" onSubmit={uploadFile}>
    //     <input type="file" name="file" onChange={saveFile} />
    //     <button>Upload</button>
    //   </form>
    // </div>
    
  );
}

export default App;
