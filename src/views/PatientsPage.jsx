/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import CustomButton from "components/CustomButton/CustomButton";
import TableList from "./TableList.jsx";

import { apiBaseURL } from "./Dashboard.jsx";

const axios = require("axios");

const frontendToBackend = {
    "Eye Diagnosis": "eye_diagnosis",
    "Systemic Diagnosis": "systemic_diagnosis",
    "Age": "age",
    "Ethnicity": "ethnicity",
    "Image Procedure Type": "image_procedure_type",
    "Labs": "labs",
    "Medication Generic Name": "medication_generic_name",
    "Medication Therapuetic Name": "medication_therapuetic_name",
    "Left Vision": "left_vision",
    "Right Vision": "right_vision",
    "Left Pressure": "left_pressure",
    "Right Pressure": "right_pressure",
    "Patient ID": "pt_id"
}

const backendToFrontend = {
    "eye_diagnosis": "Eye Diagnosis",
    "systemic_diagnosis": "Systemic Diagnosis",
    "age": "Age",
    "ethnicity": "Ethnicity",
    "image_procedure_type": "Image Procedure Type",
    "labs": "Labs",
    "medication_generic_name": "Medication Generic Name",
    "medication_therapuetic_name": "Medication Therapuetic Name",
    "left_vision": "Left Vision",
    "right_vision": "Right Vision",
    "left_pressure": "Left Pressure",
    "right_pressure": "Right Pressure",
    "pt_id": "Patient ID"
}

var table = null;

class PatientsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            "patientsIDs": [],
            "patientInfo": [],
            "filterCategories": ["Patient ID"],
            "selectedFilterCategories": [],
            "tableKey": 1,
        }
        this._calculateAge = this._calculateAge.bind(this);
        this.getPatients = this.getPatients.bind(this);
        this.getData = this.getData.bind(this);
        this.editData = this.editData.bind(this);
        this.getFilters = this.getFilters.bind(this);
        this.categoryFilterPressed = this.categoryFilterPressed.bind(this);
        this.getTable = this.getTable.bind(this);
    }

    componentDidMount() {
        this.getPatients()
    }

    _calculateAge(dob1) {
        var today = new Date();
        var birthDate = new Date(dob1);  // create a date object directly from `dob1` argument
        var age_now = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
        {
            age_now--;
        }
        return age_now;
      }

    getPatients() {
        let data = this.props.additionalInfo;
        let specials = ["Left Vision","Right Vision","Left Pressure","Right Pressure"]
        let temp_data = {}
        let tempFilterCategories = this.state["filterCategories"]
        for (var key in data) {
            temp_data[frontendToBackend[key]] = data[key]
            tempFilterCategories.push(key)
        }
        tempFilterCategories.push("Images")

        let currentComponent = this;
        axios
            .post(apiBaseURL + "/ssd_api/filter", {
                filters: temp_data
            })
            .then(function(response) {
                currentComponent.setState({"patientsIDs": response.data.result.pt_id}, () => {
                    currentComponent.getData();
                });
            })
            .catch(function(error) {
                console.log(error);
            });

        this.setState({
            "filterCategories": tempFilterCategories,
            "selectedFilterCategories": tempFilterCategories
        })
    }

    getData() {
        let currentComponent = this;
        let patientIDs = this.state.patientsIDs;
        for (var index in patientIDs) {
            var patientID = patientIDs[index]
            let link = apiBaseURL + "/ssd_api/patients?pt_id=" + patientID.toString();
            axios
                .get(link)
                .then(function(response) {
                    let currentInfo = currentComponent.state.patientInfo
                    currentInfo.push(response.data.result)
                    currentComponent.setState({"patientInfo": currentInfo}, () => {
                        currentComponent.editData();
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
            link = apiBaseURL + "/ssd_api/filter_table_with_ptid?pt_id=" + patientID.toString() + "&table_name=pt_deid"
            axios
                .get(link)
                .then(function(response) {
                    let currentInfo = currentComponent.state.patientInfo
                    currentInfo.push(response.data.result)
                    currentComponent.setState({"patientInfo": currentInfo}, () => {
                        currentComponent.editData();
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
        }
    }

    getFilters() {
        var filter_categories = this.state.filterCategories;
        var temp_filter_categories = [];
        for (var i = 0; i < filter_categories.length; i++) {
            var category_name = filter_categories[i];
            var temp_filter_category = null
            if (this.state.selectedFilterCategories.indexOf(category_name) !== -1){
                temp_filter_category = (
                    <CustomButton style={styles.buttonDivPressed} title = {category_name} onClick = {e => this.categoryFilterPressed(e)} > {category_name} </CustomButton>
                );
            }
            else {
                temp_filter_category = (
                    <CustomButton style={styles.buttonDiv} title = {category_name} onClick = {e => this.categoryFilterPressed(e)} > {category_name} </CustomButton>
                );
            }
            temp_filter_categories.push(temp_filter_category);
        }
        return temp_filter_categories
    }

    editData() {
        if (this.state.patientsIDs.length * 2 !== this.state.patientInfo.length) {
            return
        }
        let patientInfo = {}

        for (var i = 0; i < this.state.patientInfo.length; i++) {
            let patient = this.state.patientInfo[i]
            let key_list = Object.keys(patient)
            if (key_list[0] !== "data") {
                patientInfo[key_list[0]] = patient[key_list[0]]
            }
        }

        for (var i = 0; i < this.state.patientInfo.length; i++) {
            let patient = this.state.patientInfo[i]
            let key_list = Object.keys(patient)
            if (key_list[0] === "data") {
                var patientPersonal = patient.data[0]
                var patientID = patientPersonal.pt_id
                var ethnicity = patientPersonal.race_1
                var age = this._calculateAge(patientPersonal.dob)
                patientInfo[patientID]["ethnicity"] = ethnicity;
                patientInfo[patientID]["age"] = age;
            }
        }
        this.setState({
            "patientInfo": patientInfo,
            "loaded": "true",
        })
    }

    getTable() {
        if (!this.state.loaded) {
            return null
        }
        let patientInfo = this.state.patientInfo
        let categoryTitles = this.state.selectedFilterCategories;
        let tableData = []
        for (var i = 0; i < this.state.patientsIDs.length; i++) {
            let patientID = this.state.patientsIDs[i]
            let tempPatientInfo = []
            for (var j = 0; j < this.state.selectedFilterCategories.length; j++) {
                let category = this.state.selectedFilterCategories[j]
                if (category === "Patient ID") {
                    tempPatientInfo.push(patientID)
                }
                else if (category === "Images") {
                    tempPatientInfo.push("images")
                }
                else {
                    tempPatientInfo.push(patientInfo[patientID][frontendToBackend[category]])
                }
            }
            tableData.push(tempPatientInfo)
        }
        return <TableList key = {this.state.tableKey} columns={categoryTitles} rows={tableData}>hello</TableList>
    }

    categoryFilterPressed(e) {
        let category = e.target.title;
        if (this.state.selectedFilterCategories.indexOf(category) === -1) {
          this.state.selectedFilterCategories.push(category);
          this.setState({
            selectedFilterCategories: this.state.selectedFilterCategories,
            tableKey: this.state.tableKey + 1
          });
        } else {
          var new_list = this.state.selectedFilterCategories.filter(function(name) {
            return name !== category;
          });
          this.setState({
            selectedFilterCategories: new_list,
            tableKey: this.state.tableKey + 1
          });
        }
      }

    createLegend(json) {
        var legend = [];
        for (var i = 0; i < json["names"].length; i++) {
            var type = "fa fa-circle text-" + json["types"][i];
            legend.push(<i className={type} key={i} />);
            legend.push(" ");
            legend.push(json["names"][i]);
        }
    return legend;
  }

    render() {
        console.log("state",this.state)
        var all_filters = this.getFilters()

        return (
            <div className="content">
            <Grid fluid>
                <Row style = {styles.titleStyle}>
                    <Col lg={12} sm={8} style = {styles.titleText}>
                        <div>
                            Your Patient Cohort
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col lg={3} sm={3} style = {styles.sideDivStyle}>
                        {all_filters}
                    </Col>
                    <Col lg={9} sm={6} style = {styles.mainDivStyle}>
                        <Grid fluid>
                          <Row>
                            {this.getTable()}
                          </Row>
                        </Grid>
                    </Col>
                </Row>
            </Grid>
        </div>
        );
    }
}

export default PatientsPage;

const styles = {
    titleStyle: {
        "height": "10vh",
        "margin-bottom": "2vh",
    },
    titleText: {
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "font-weight": "bold",
        "font-size": "30px",
    },
    buttonDiv: {
        "width": "100%",
        "margin": "1vh",
        "background-color": "white",
        "color": "black",
        "border": "solid 2px black",
    },
    buttonDivPressed: {
      "width": "100%",
      "margin": "1vh",
      "background-color": "#78deec",
      "color": "black",
      "border": "solid 2px black",
  },
    sideDivStyle: {
        "height": "80vh",
    },
    mainDivStyle : {
        "height": "90vh",
    },
    mainDivCategoryStyle : {
        "height": "20vh",
        "overflow": "scroll",
        "border": "solid 2px black",
        "margin": "1vh",
    },
    mainDivButtonTitle: {
      "display": "flex",
      "justify-content": "center",
      "font-weight": "bold",
      "text-decoration": "underline",
    },
    underTitleStyle: {
      "display": "flex",
      "justify-content": "flex-end",
      "align-items": "flex-end",
      "padding-right": "16%"
    },
    buttonUpperSubmit: {
      "width": "15%",
      "margin-right": "1vh",
      "color": "black",
      "border": "solid 2px black",
      "font-weight": "bold",
      "background-color": "#a3ec9a",
    },
    buttonUpperReset: {
      "width": "15%",
      "margin-right": "1vh",
      "color": "black",
      "border": "solid 2px black",
      "font-weight": "bold",
      "background-color": "#ec585a",
    }
}