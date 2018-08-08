import React from "react";
import { inject, observer } from "mobx-react";
import { FormGroup, ControlLabel, Glyphicon, Alert, Button, DropdownButton, MenuItem } from "react-bootstrap";
import ReactDataSheet from "react-datasheet";
import injectStyles from "react-jss";
import { isFunction } from "lodash";

const styles = {
  "@global":{
    "span.data-grid-container, span.data-grid-container:focus": ` 
      outline: none;
    `,

    ".data-grid-container .data-grid": ` 
      table-layout: fixed;
      border-collapse: collapse;
      width:100%;
    `,

    ".data-grid-container .data-grid .cell.updated": ` 
        background-color: rgba(0, 145, 253, 0.16);
        transition : background-color 0ms ease ;
    `,

    ".data-grid-container .data-grid .cell": ` 
      height: 17px;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      cursor: cell;
      background-color: white;
      transition : background-color 500ms ease;
      vertical-align: middle;
      text-align: right;
      border: 1px solid #DDD;
      padding: 0;
    `,

    ".data-grid-container .data-grid .cell.selected": ` 
      border: 1px double rgb(33, 133, 208);
      transition: none;
      box-shadow: inset 0 -100px 0 rgba(33, 133, 208, 0.15);
    `,

    ".data-grid-container .data-grid .cell.read-only": ` 
      background: whitesmoke;
      color: #999;
      text-align: center;
      font-weight: normal;
    `,

    ".data-grid-container .data-grid .cell > .text": ` 
      padding: 2px 5px;
      text-overflow: ellipsis;
      overflow: hidden;
    `,

    ".data-grid-container .data-grid .cell > input": ` 
      outline: none !important;
      border: 1px solid rgb(33, 133, 208);
      text-align:right;
      width: 100%;
      height: 100%;
      background: none;
      display: block;
    `,

    ".data-grid-container .data-grid .cell ": ` 
      vertical-align: bottom;
    `,

    ".data-grid-container .data-grid .cell, .data-grid-container .data-grid.wrap .cell, .data-grid-container .data-grid.wrap .cell.wrap, .data-grid-container .data-grid .cell.wrap, .data-grid-container .data-grid.nowrap .cell.wrap, .data-grid-container .data-grid.clip .cell.wrap": ` 
      white-space: normal;
    `,

    ".data-grid-container .data-grid.nowrap .cell, .data-grid-container .data-grid.nowrap .cell.nowrap, .data-grid-container .data-grid .cell.nowrap, .data-grid-container .data-grid.wrap .cell.nowrap, .data-grid-container .data-grid.clip .cell.nowrap": ` 
      white-space: nowrap;
      overflow-x: visible;
    `,

    ".data-grid-container .data-grid.clip .cell, .data-grid-container .data-grid.clip .cell.clip, .data-grid-container .data-grid .cell.clip, .data-grid-container .data-grid.wrap .cell.clip, .data-grid-container .data-grid.nowrap .cell.clip": ` 
      white-space: nowrap;
      overflow-x: hidden;
    `,

    ".data-grid-container .data-grid .cell .value-viewer, .data-grid-container .data-grid .cell .data-editor": ` 
      padding: 2px 4px;
      display: block;
      min-height:24px;
    `,

    ".data-grid-container .data-grid .action-header": {
      width:"23px"
    },

    ".data-grid-container .data-grid .action-cell": {
      background:"white",
      border: "1px solid #DDD",
      "& .dropdown-toggle":{
        border:"none",
        borderRadius:"0"
      },
      "& .dropdown-menu":{
        left: "auto",
        right: 0
      }
    }
  },
  btnAddRow:{
    marginTop:"12px"
  }
};

/**
 * Todo: fill description
 * @class DataSheetField
 * @memberof FormFields
 * @namespace DataSheetField
 */

@inject("formStore")
@injectStyles(styles)
@observer
export default class DataSheetField extends React.Component {
  //The only way to trigger an onChange event in React is to do the following
  //Basically changing the field value, bypassing the react setter and dispatching an "input"
  // event on a proper html input node
  //See for example the discussion here : https://stackoverflow.com/a/46012210/9429503
  triggerOnChange = () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
      .call(this.hiddenInputRef, JSON.stringify(this.props.field.getValue(false)));
    var event = new Event("input", { bubbles: true });
    this.hiddenInputRef.dispatchEvent(event);
  }

  handleCellChange = (changes, outOfScopeChanges) => {
    const { field } = this.props;
    const proceed = () => {
      field.applyChanges(changes, outOfScopeChanges);
      this.triggerOnChange();
    };
    if(isFunction(this.props.onBeforeSetValue)){
      this.props.onBeforeSetValue(proceed, field, changes, outOfScopeChanges);
    } else {
      proceed();
    }
  }

  handleAddRow = () => {
    const { field } = this.props;
    if(field.value.length < field.max){
      const proceed = () => {
        field.addRow();
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeAddRow)){
        this.props.onBeforeAddRow(proceed, field);
      } else {
        proceed();
      }
    }
  }

  handleRemoveRow(row, e){
    const { field } = this.props;
    e.stopPropagation();
    if(field.value.length > field.min){
      const proceed = () => {
        field.removeRow(row);
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeRemoveRow)){
        this.props.onBeforeRemoveRow(proceed, field, row);
      } else {
        proceed();
      }
    }
  }

  handleMoveUpRow(rowIndex, e){
    const { field } = this.props;
    e.stopPropagation();
    if(rowIndex > 0){
      const proceed = () => {
        field.moveRow(rowIndex, rowIndex-1);
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeMoveUpRow)){
        this.props.onBeforeMoveUpRow(proceed, field, rowIndex);
      } else {
        proceed();
      }
    }
  }

  handleMoveDownRow(rowIndex, e){
    const { field } = this.props;
    e.stopPropagation();
    if(rowIndex < field.value.length - 1){
      const proceed = () => {
        field.moveRow(rowIndex, rowIndex+1);
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeMoveDownRow)){
        this.props.onBeforeMoveDownRow(proceed, field, rowIndex);
      } else {
        proceed();
      }
    }
  }

  handleDuplicateRow(rowIndex, e){
    const { field } = this.props;
    e.stopPropagation();
    if(field.value.length < field.max){
      const proceed = () => {
        this.props.field.duplicateRow(rowIndex);
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeDuplicateRow)){
        this.props.onBeforeDuplicateRow(proceed, field, rowIndex);
      } else {
        proceed();
      }
    }
  }

  handleAddRowAbove(rowIndex, e){
    const { field } = this.props;
    e.stopPropagation();
    if(field.value.length < field.max){
      const proceed = () => {
        this.props.field.addRow(rowIndex);
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeAddRow)){
        this.props.onBeforeAddRow(proceed, field, rowIndex);
      } else {
        proceed();
      }
    }
  }

  handleAddRowBelow(rowIndex, e){
    const { field } = this.props;
    e.stopPropagation();
    if(field.value.length < field.max){
      const proceed = () => {
        this.props.field.addRow(rowIndex+1);
        this.triggerOnChange();
      };
      if(isFunction(this.props.onBeforeAddRow)){
        this.props.onBeforeAddRow(proceed, field, rowIndex+1);
      } else {
        proceed();
      }
    }
  }

  handleChange(e){
    e.preventDefault();
  }

  handleKeyDown = (e) => {
    const { field } = this.props;
    if(e.target.matches("input.data-editor") && e.keyCode === 13){
      if(this.dataSheetRef.state.end.i !== undefined && this.dataSheetRef.state.end.i === field.value.length-1){
        if(field.value.length < field.max){
          field.addRow();
          //Set state of the child component to manually change the selected position
          //Without havind to go in full control mode of the position.
          this.dataSheetRef.setState({
            start:{i:this.dataSheetRef.state.end.i+1, j:this.dataSheetRef.state.end.j},
            end:{i:this.dataSheetRef.state.end.i+1, j:this.dataSheetRef.state.end.j}
          });
          this.triggerOnChange();
        }
      }
    }
  }

  keyGenerator = (row) => {
    return this.props.formStore.getGeneratedKey(this.props.field.value[row], "DataSheetFieldRow");
  }

  renderCell = (cell) => {
    if(cell.actions){
      if(cell.header){
        return "";
      } else {
        return (
          <div>
            <Button bsStyle={"primary"} bsSize={"xsmall"} onClick={this.handleRemoveRow.bind(this, cell.row)}><Glyphicon glyph="remove"/></Button>
          </div>
        );
      }
    } else {
      return cell.value;
    }
  }

  renderRow = (props) => {
    const { field } = this.props;
    const { rowControlRemove, rowControlMove, rowControlDuplicate, rowControlAdd } = field;
    return (
      <tr>
        {props.children}
        {(rowControlRemove || rowControlMove || rowControlDuplicate || rowControlAdd) && props.cells[0].row?
          <td className={"action-cell"}>
            <DropdownButton
              bsSize="xsmall"
              title={<Glyphicon glyph={"menu-hamburger"}/>}
              id={`row-actions-${props.row}`}
              noCaret
            >
              {rowControlMove? <MenuItem disabled={props.row <= 0} onClick={this.handleMoveUpRow.bind(this, props.row)}><Glyphicon glyph="arrow-up"/>&nbsp;Move up</MenuItem>:null}
              {rowControlMove? <MenuItem disabled={props.row >= field.value.length - 1} onClick={this.handleMoveDownRow.bind(this, props.row)}><Glyphicon glyph="arrow-down"/>&nbsp;Move down</MenuItem>:null}
              {rowControlMove && (rowControlDuplicate || rowControlRemove || rowControlAdd)? <MenuItem divider />:null}
              {rowControlDuplicate? <MenuItem disabled={field.value.length >= field.max} onClick={this.handleDuplicateRow.bind(this, props.row)}><Glyphicon glyph="duplicate"/>&nbsp;Duplicate</MenuItem>:null}
              {rowControlDuplicate && (rowControlRemove || rowControlAdd)? <MenuItem divider />:null}
              {rowControlRemove? <MenuItem disabled={field.value.length <= field.min} onClick={this.handleRemoveRow.bind(this, props.cells[0].row)}><Glyphicon glyph="trash"/>&nbsp;Delete</MenuItem>:null}
              {rowControlRemove && rowControlAdd? <MenuItem divider />:null}
              {rowControlAdd? <MenuItem disabled={field.value.length >= field.max} onClick={this.handleAddRowAbove.bind(this, props.row)}><Glyphicon glyph="plus"/>&nbsp;Add a new row above</MenuItem>:null}
              {rowControlAdd? <MenuItem disabled={field.value.length >= field.max} onClick={this.handleAddRowBelow.bind(this, props.row)}><Glyphicon glyph="plus"/>&nbsp;Add a new row below</MenuItem>:null}
            </DropdownButton>
          </td>
          :null}
      </tr>
    );
  }

  renderSheet = props => {
    const { field } = this.props;
    const { rowControlRemove, rowControlMove, rowControlDuplicate, rowControlAdd } = field;
    return (
      <table className={props.className}>
        <thead>
          <tr>
            {field.headers.map(header => {
              if(header.show !== false){
                return <th key={header.key} className={"cell read-only"}>{header.label}</th>;
              }
            }).filter(cell => cell !== undefined)}
            {rowControlRemove || rowControlMove || rowControlDuplicate || rowControlAdd? <th className={"action-header"} />: null}
          </tr>
        </thead>
        <tbody>
          {props.children}
        </tbody>
      </table>
    );
  };

  render() {
    /*if(this.props.formStore.readMode || this.props.field.readMode){
      return this.renderReadMode();
    }*/

    const { field, classes } = this.props;
    const { label, value: values, headers, disabled, readOnly, validationState, validationErrors, max } = field;

    const grid = [];

    values.forEach((value) => {
      grid.push(headers.map(header => {
        if(header.show !== false){
          return {value: value[header.key], row: value, key: header.key, readOnly: !!header.readOnly};
        }
      }).filter(cell => cell !== undefined));
    });

    return (
      <FormGroup
        className={`${classes.container} quickfire-field-data-sheet ${!values.length? "quickfire-empty-field": ""}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}
        validationState={validationState}>
        {label && <ControlLabel className={"quickfire-label"}>{label}</ControlLabel>}

        <div>
          <div className={"quickfire-data-sheet-container"} onChange={this.handleChange} onKeyDown={this.handleKeyDown}>
            <ReactDataSheet
              ref={ref => this.dataSheetRef = ref}
              overflow={"clip"}
              data={grid}
              valueRenderer={this.renderCell}
              onCellsChanged={this.handleCellChange}
              rowRenderer={this.renderRow}
              sheetRenderer={this.renderSheet}
              keyFn={this.keyGenerator}
            />
            <Button disabled={values.length >= max} bsClass={`${classes.btnAddRow} quickspark-data-sheet-add-button btn btn-primary btn-xs`} onClick={this.handleAddRow}>Add a row</Button>
          </div>
          <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>
        </div>

        {validationErrors && <Alert bsStyle="danger">
          {validationErrors.map(error => <p key={error}>{error}</p>)}
        </Alert>}

      </FormGroup>
    );
  }

  /*renderReadMode(){
    let {
      label,
      value,
      disabled,
      readOnly
    } = this.props.field;

    const {classes} = this.props;

    return (
      <div className={`quickfire-field-data-sheet ${!value.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}>

      </div>
    );
  }*/
}
