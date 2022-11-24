import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Select from 'react-select';

export default function Query(props) {
  const [studentInput, setStudentInput] = React.useState({
    name: "", spec:"", hired: undefined, company: "", role: "", FoI: [], cntField: ""
  });

  const [companyInput, setCompanyInput] = React.useState({
    name: "", industry: ""
  });

  const specOptions = [
    { value: 'General (28)', label: 'General (28)' },
    { value: 'Software Engineering', label: 'Software Engineering' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Intelligent Robotics', label: 'Intelligent Robotics' },
    { value: 'Multimedia and Creative Technologies', label: 'Multimedia and Creative Technologies' },
    { value: 'High Performance Computing and Simulation', label: 'High Performance Computing and Simulation' },
    { value: 'Computer Security', label: 'Computer Security' },
    { value: 'Computer Networks', label: 'Computer Networks' },
    { value: 'Scientists and Engineers (37)', label: 'Scientists and Engineers (37)' },
  ];

  const fieldOptions = [
    { value: 'Name', label: 'Name'},
    { value: 'Spec', label: 'Spec'},
    { value: 'Hired', label: 'Hired'},
    { value: 'Company', label: 'Company'},
    { value: 'Role', label: 'Role'}
  ];

  const [localSpec, setLocalSpec] = React.useState(null);
  const [localFoI, setLocalFoI] = React.useState(['Name', 'Spec', 'Hired', 'Company', 'Role']);
  const [localFtC, setLocalFtC] = React.useState(null);
  
  function handleSpecChange(event) {
    setLocalSpec(event.value);
    console.log("localSpec", localSpec);
  }

  function handleFtCChange(event) {
    setLocalFtC(event.value);
    console.log("localFtC", localFtC);
  }

  function handleFoIChange(event) {
    let ls = []
    for(let e of event) {
      ls.push(e.value)
    }
    setLocalFoI(ls);
    console.log("localFoI", localFoI);
  }

  function handleStudentChange(event) {
    setStudentInput(pretStudentInput => {
      return {
        ...pretStudentInput,
        [event.target.name]: event.target.value
      }
    });
  }

  function onSelect(key, event) {
    console.log(key)
    console.log(event)
  }

  function handleCompanyChange(event) {
    setCompanyInput(prevCompanyInput => {
      return {
        ...prevCompanyInput,
        [event.target.name]: event.target.value
      }
    });
  }

  function submitStudentQuery(event) {
    // console.log("localSpec", localSpec);
    // console.log("localFoI", localFoI);
    // console.log("localFtC", localFtC);
    setStudentInput(prevStudentInput => {
      return {
        ...prevStudentInput,
        spec: localSpec,
        FoI: localFoI,
        cntField: localFtC
      }
    });

  }

  function submitCompanyQuery(event) {

  }

  return (
    <div className="lvl1Section row">
      <div className="column2">
        <form className="lvl1Section row" onSubmit={submitStudentQuery}>
          <h3>Student:</h3>
          <div className="column3">
            <label>Name:</label>
            <br/>
            <input
              type="text"
              name="name"
              onChange={handleStudentChange}
              value={studentInput.name}
            />
            <br/><br/>
            <label>Specification:</label>
            <Select
              name='spec'
              defaultValue={localSpec}
              onChange={handleSpecChange}
              options={specOptions}
            />
            <br/>
            <label>Hired:</label>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <input 
              type="radio" 
              id="hiredTrue" 
              value="True" 
              name="hiredTrue" 
              checked={studentInput.hired === true} 
              onChange={() => {
                setStudentInput(pretStudentInput => {
                  return {
                    ...pretStudentInput,
                    hired: true
                  }
                })
              }}
            />
            <label htmlFor="hiredTrue">True</label>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <input 
              type="radio" 
              id="hiredFalse" 
              value="False" 
              name="hiredFalse" 
              checked={studentInput.hired === false} 
              onChange={() => {
                setStudentInput(pretStudentInput => {
                  return {
                    ...pretStudentInput,
                    hired: false
                  }
                })
              }}
            />
            <label htmlFor="hiredFalse">False</label>
          </div>
          <div className="column3">
            <label>Company:</label>
            <br/>
            <input
              type="text"
              name="company"
              onChange={handleStudentChange}
              value={studentInput.company}
            />
            <br/><br/>
            <label>Field of Interest:</label>
            <br/>
            <Select
              defaultValue={[fieldOptions[0], fieldOptions[1], fieldOptions[2], fieldOptions[3], fieldOptions[4]]}
              isMulti
              name="foi"
              options={fieldOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleFoIChange}
            />
          </div>
          <div className="column3">
            <label>Role:</label>
            <br/>
            <input
              type="text"
              name="role"
              onChange={handleStudentChange}
              value={studentInput.role}
            />
            <br/><br/>
            <label>Field to Count:</label>
            <br/>
            <Select
              name='ftc'
              defaultValue={localFtC}
              onChange={handleFtCChange}
              options={fieldOptions}
            />
            <br/>
            <button className="btn btn-danger center">Submit</button>
          </div>
        </form>
        <form className="lvl1Section row" onSubmit={submitCompanyQuery}>
          <h3>Company:</h3>
          <div className="column2">
            <label>Name:&nbsp; &nbsp; </label>
            <input
              type="text"
              name="name"
              onChange={handleCompanyChange}
              value={companyInput.name}
              size="50"
            />
            <br/><br/>
            <label>Industry:&nbsp; &nbsp; </label>
            <input
              type="text"
              name="industry"
              onChange={handleCompanyChange}
              value={companyInput.industry}
              size="50"
            />
          </div>
          <div className="column2">
            <button className="btn btn-danger center">Submit</button>
          </div>
        </form>
      </div>
      
      <div className="column2">
        <label>query result:</label>
      </div>
    </div>
  )
}