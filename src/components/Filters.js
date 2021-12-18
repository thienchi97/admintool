import React, { Component } from "react";
import { DatePicker } from 'antd';
export default class Filters extends Component {
  render() {
    return (
      <div className="table-data__tool">
        <div className="table-data__tool-left">
          <div className="rs-select2--light rs-select2--md">
                      <select className="js-select2" name="property">
                        <option >Cơ sở</option>
                        <option  >Option 1</option>
                        <option  >Option 2</option>
                      </select>
                      <div className="dropDownSelect2" />
                    </div> 
           <div className="rs-select2--light rs-select2--sm">
            <select className="js-select2" name="property">
              <option>Lớp</option>
              <option>16050311</option>
              <option>16050310</option>
            </select>
            <div className="dropDownSelect2" />
          </div> 
          <button className="au-btn-filter">
            <i className="zmdi zmdi-filter-list" />
            filters
          </button>
        </div>
        <div className="table-data__tool-right">
          <button className="au-btn au-btn-icon au-btn--green au-btn--small">
            <i className="zmdi zmdi-plus" />
            Export
          </button>
       
        </div>
      </div>
    );
  }
}
