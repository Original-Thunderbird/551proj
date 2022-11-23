import React from 'react';
import Axios from 'axios'
import Explorer from './explorer';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

function App() {
  var cmd = '', params = [], filename = ''

  const [myOutput, setMyOutput] = React.useState({
    cmdErr: '', queryErr: '', curDir: '/', cmdOutput: '', queryOutput: ''
  })

  const [myInput, setMyInput] = React.useState({
    cmdStr: '', query:'', srcDB:'MySQL'
  })

  React.useEffect(() => {
    Axios.post('http://localhost:3001/db', {db: myInput.srcDB}).then((res) => {
      console.log(res.data);
    });
  });

  function handleChange(event) {
    // console.log(event.target.name, event.target.value)
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
    // console.log('raw q:', myInput.query);
    Axios.post('http://localhost:3001/query', {rawQuery: myInput.query}).then((res) => {
      console.log(res.data);
      setMyOutput(prevOutput => {
        return {
          ...prevOutput,
          queryOutput: res.data.output,
          queryErr: res.data.err
        }
      })
    })
    setMyInput({
      cmdStr: '', query:''
    })
  }

  function handleDB(event) {
    setMyInput(prevInput => {
      return {
        ...prevInput,
        [event.target.name]: event.target.value
      }
    });
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
      default:
        params = [words[1]];
        break;
    }
    return [cmd, params, filename]
  }

  return (
    <div>
      <Explorer inputCrtl={handleChange}/>

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
        <br/>
        <label>err:{myOutput.cmdErr}</label>
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
        <br/>
        <label>err:{myOutput.queryErr}</label>
        <br/>
        <label>outPut:{myOutput.queryOutput}</label>
      </form>
      <br/>

      <label>Current DB:</label>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <input type="radio" id="Firebase" value="Firebase" name="srcDB" checked={myInput.srcDB === 'Firebase'} onChange={handleDB}/>
      <label htmlFor="Firebase">Firebase</label>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <input type="radio" id="MySQL" value="MySQL" name="srcDB" checked={myInput.srcDB === 'MySQL'} onChange={handleDB}/>
      <label htmlFor="MySQL">MySQL</label>
      <br/>
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
