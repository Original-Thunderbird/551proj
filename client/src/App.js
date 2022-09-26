import React from 'react';
import Axios from 'axios'
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [formData, setFormData] = React.useState({
    name: "", age:"", country:""
  })
  const [empList, setEmpList] = React.useState([])
  const [file, setFile] = React.useState();
  const [fileName, setFileName] = React.useState("");

  function handleChange(event) {
    console.log(event.target.name, event.target.value)
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value
      }
    })
  }

  function getEmployees() {
    Axios.get('http://localhost:3001/employees').then((res) => {
      setEmpList(res.data);
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormData({
      name: "", age:"", country:""
    })
    console.log("submit")
    Axios.post('http://localhost:3001/create', formData).then(() => {
      console.log("success");
    })
  }

  const saveFile = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const uploadFile = async (e) => {
    e.preventDefault()
    const data = new FormData();
    console.log(file)
    console.log(fileName)
    data.append('file', file, fileName);
    console.log(data)
    await Axios.post('http://localhost:3001/upload', data).then((res) => {
      console.log(res.statusText);
    });
  };

  return (
    <div>
      <form  className="form-group" onSubmit={handleSubmit}>
        <label>name:     </label>
        <input 
          type="text"
          placeholder="your name"
          onChange={handleChange}
          name="name"
          value={formData.name}
        />
        <label>age:     </label>
        <input 
          type="text"
          placeholder="your age"
          onChange={handleChange}
          name="age"
          value={formData.age}
        />
        <label>country:     </label>
        <input 
          type="text"
          placeholder="your country"
          onChange={handleChange}
          name="country"
          value={formData.country}
        />
        <button>Submit</button>
      </form>
      {/* <button className="btn btn-primary" onClick={getEmployees}>GetAll</button>
      {empList.map(e => {
        return <div>{e.name},{e.age},{e.country}</div>
      })} */}
      <form className="App" onSubmit={uploadFile}>
        <input type="file" name="file" onChange={saveFile} />
        <button>Upload</button>
      </form>
    </div>
  );
}

export default App;
