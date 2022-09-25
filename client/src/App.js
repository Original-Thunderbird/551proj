import React from 'react';
import './App.css';
import Axios from 'axios'

function App() {
  const [formData, setFormData] = React.useState({
    name: "", age:"", country:""
  })

  const [empList, setEmpList] = React.useState([])

  function handleChange(event) {
    console.log(event.target.name, event.target.value)
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value
      }
    })
  }

  function submitForm() {
    Axios.post('http://localhost:3001/create', formData).then(() => {
      console.log("success");
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
    submitForm()
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
      <button onClick={getEmployees}>GetAll</button>
      {empList.map(e => {
        return <div>{e.name},{e.age},{e.country}</div>
      })}
    </div>
    
  );
}

export default App;
