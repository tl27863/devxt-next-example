"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import "./form.scss";
import { ValidationRule } from "devextreme-react/common";

import Form, {
  GroupItem,
  SimpleItem,
  Label,
  CustomRule,
  Item,
  RequiredRule,
  FormRef,
  type FormTypes,
} from "devextreme-react/form";
import "devextreme-react/text-area";
import "devextreme-react/date-range-box";
import "devextreme-react/autocomplete";
import Validator from "devextreme/ui/validator";

import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Editing,
} from "devextreme-react/data-grid";

import CardView, {
  CardCover,
  Column as CardColumn,
  Selection,
  Paging as CardPaging,
  HeaderFilter,
  SearchPanel,
  // CardViewRef,
} from "devextreme-react/card-view";

import service, { Employee } from "./data";

import LabelTemplate from "./LabelTemplate";
import LabelNotesTemplate from "./LabelNotesTemplate";
import FileUploader from "devextreme-react/file-uploader";
import Button from "devextreme-react/button";
import notify from "devextreme/ui/notify";

const validationRules: {
  position: ValidationRule[];
  hireDate: ValidationRule[];
  phone: ValidationRule[];
  email: ValidationRule[];
} = {
  position: [{ type: "required", message: "Position is required." }],
  hireDate: [{ type: "required", message: "Hire Date is required." }],
  phone: [],
  email: [{ type: "required", message: "email is required." }],
};

const nameEditorOptions = { disabled: true };

const positionEditorOptions = {
  items: service.getPositions(),
  searchEnabled: true,
  value: "",
};

const hireDateEditorOptions = {
  startDatePlaceholder: "Start Date",
  endDatePlaceholder: "End Date",
  acceptCustomValue: false,
  openOnFieldClick: true,
};

const validateHireDatesRange = ({ value }) => {
  const [startDate, endDate] = value;

  if (startDate === null || endDate === null) {
    return true;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.abs((endDate - startDate) / millisecondsPerDay);

  return daysDifference < 25;
};

const validateHireDatesPresence = ({ value }) => {
  const [startDate, endDate] = value;

  if (startDate === null && endDate === null) {
    return true;
  }

  return startDate !== null && endDate !== null;
};

const birthDateEditorOptions = { width: "100%", disabled: false };
const notesEditorOptions = { height: 90, maxLength: 200 };
const phoneEditorOptions = {
  mask: "+62 800-0000-00999",
  maskChar: " ",
  valueChangeEvent: "keyup",
  useMaskedValue: true,
  showMaskMode: "onFocus",
  maskInvalidMessage:
    "Please enter a valid Indonesian mobile number (10-13 digits total).",
};

export default function Page() {
  const formRef = useRef<FormRef>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Employee>(service.getEmployee());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load employees on component mount
  useEffect(() => {
    setEmployees(service.getAllEmployees());
  }, []);

  const refreshEmployees = useCallback(() => {
    setEmployees(service.getAllEmployees());
  }, []);

  const resetForm = useCallback(() => {
    setFormData(service.getEmployee());
    setIsEditing(false);
    setEditingId(null);
    formRef.current?.instance().resetValues();
  }, []);

  const changePasswordMode = useCallback((name) => {
    const editor = formRef.current?.instance().getEditor(name);
    if (editor) {
      editor.option(
        "mode",
        editor.option("mode") === "text" ? "password" : "text",
      );
    }
  }, []);

  const getPasswordOptions = useCallback(
    () => ({
      mode: "password",
      valueChangeEvent: "keyup",
      onValueChanged: () => {
        if (formRef != null) {
          const editor = formRef.current
            ?.instance()
            .getEditor("ConfirmPassword");
          if (editor && editor.option("value")) {
            const instance = Validator.getInstance(
              editor.element(),
            ) as Validator;
            instance.validate();
          }
        }
      },
      buttons: [
        {
          name: "password",
          location: "after",
          options: {
            stylingMode: "text",
            icon: "eyeopen",
            onClick: () => changePasswordMode("Password"),
          },
        },
      ],
    }),
    [changePasswordMode],
  );

  const validateForm = useCallback((e: FormTypes.ContentReadyEvent) => {
    e.component.validate();
  }, []);

  const fileUploaderLabel = { "aria-label": "Select Photo" };

  const onSubmit = useCallback(() => {
    const formInstance = formRef.current?.instance();
    if (formInstance) {
      const validationResult = formInstance.validate();
      if (validationResult.isValid) {
        const currentFormData = formInstance.option("formData");

        if (isEditing && editingId !== null) {
          // Update existing employee
          const updatedEmployee = service.updateEmployee(
            editingId,
            currentFormData,
          );
          if (updatedEmployee) {
            notify("Employee updated successfully!", "success", 2000);
            refreshEmployees();
            resetForm();
          }
        } else {
          // Add new employee
          service.addEmployee(currentFormData);
          notify("Employee added successfully!", "success", 2000);
          refreshEmployees();
          resetForm();
        }
      } else {
        notify("Please fix the validation errors", "error", 2000);
      }
    }
  }, [isEditing, editingId, refreshEmployees, resetForm]);

  const onEditEmployee = useCallback((employee: Employee) => {
    setFormData(employee);
    setIsEditing(true);
    setEditingId(employee.ID);
    formRef.current?.instance().option("formData", employee);
    notify("Employee loaded for editing", "info", 2000);
  }, []);

  const onDeleteEmployee = useCallback(
    (id: number) => {
      const success = service.deleteEmployee(id);
      if (success) {
        notify("Employee deleted successfully!", "success", 2000);
        refreshEmployees();
        // Reset form if we're editing the deleted employee
        if (editingId === id) {
          resetForm();
        }
      }
    },
    [editingId, refreshEmployees, resetForm],
  );

  const onCancelEdit = useCallback(() => {
    resetForm();
    notify("Edit cancelled", "info", 2000);
  }, [resetForm]);

  return (
    <div className="form-container">
      <Form ref={formRef} onContentReady={validateForm} formData={formData}>
        <GroupItem
          colCount={2}
          caption={isEditing ? "Edit Employee Details" : "Employee Details"}
        >
          <Item
            dataField="FirstName"
            editorOptions={{ ...nameEditorOptions, disabled: false }}
          >
            <Label render={LabelTemplate("user")} />
          </Item>
          <Item
            dataField="LastName"
            editorOptions={{ ...nameEditorOptions, disabled: false }}
          >
            <Label render={LabelTemplate("user")} />
          </Item>
          <Item
            dataField="Position"
            editorType="dxSelectBox"
            editorOptions={positionEditorOptions}
            validationRules={validationRules.position}
          >
            <Label render={LabelTemplate("info")} />
          </Item>
          <Item dataField="Email" validationRules={validationRules.email}>
            <Label render={LabelTemplate("email")} />
          </Item>
          <SimpleItem
            dataField="Password"
            editorType="dxTextBox"
            editorOptions={getPasswordOptions()}
          >
            <RequiredRule message="Password is required" />
          </SimpleItem>
          <SimpleItem
            dataField="ConfirmPassword"
            editorType="dxTextBox"
            editorOptions={{
              mode: "password",
              valueChangeEvent: "keyup",
              buttons: [
                {
                  name: "password",
                  location: "after",
                  options: {
                    stylingMode: "text",
                    icon: "eyeopen",
                    onClick: () => changePasswordMode("ConfirmPassword"),
                  },
                },
              ],
            }}
          >
            <RequiredRule message="Please confirm your password" />
            <CustomRule
              message="Password and Confirm Password do not match"
              validationCallback={({ value }) => {
                const passwordValue = formRef.current
                  ?.instance()
                  .getEditor("Password")
                  ?.option("value");
                return value === passwordValue;
              }}
            />
          </SimpleItem>
          <SimpleItem
            dataField="HireDate"
            editorType="dxDateRangeBox"
            editorOptions={hireDateEditorOptions}
          >
            <Label text="Hire Date" />
            <CustomRule
              message="The hire period must not exceed 25 days"
              validationCallback={validateHireDatesRange}
            />
            <CustomRule
              message="Both start and end dates must be selected"
              validationCallback={validateHireDatesPresence}
            />
          </SimpleItem>
          <Item
            dataField="BirthDate"
            editorType="dxDateBox"
            editorOptions={birthDateEditorOptions}
          >
            <Label render={LabelTemplate("event")} />
          </Item>
          <Item
            dataField="Phone"
            editorOptions={phoneEditorOptions}
            validationRules={validationRules.phone}
          >
            <Label render={LabelTemplate("tel")} />
          </Item>
          <Item dataField="Address">
            <Label render={LabelTemplate("home")} />
          </Item>
          <Item
            dataField="Notes"
            colSpan={2}
            editorType="dxTextArea"
            editorOptions={notesEditorOptions}
          >
            <Label render={LabelNotesTemplate} />
          </Item>
          <Item
            label={{ visible: false }}
            render={() => (
              <div className="fileuploader-container">
                <FileUploader
                  inputAttr={fileUploaderLabel}
                  selectButtonText="Select photo"
                  labelText=""
                  accept="image/*"
                  uploadMode="useForm"
                />
              </div>
            )}
          />

          {/* Form buttons */}
          <Item
            label={{ visible: false }}
            colSpan={2}
            render={() => (
              <div className="form-buttons">
                <Button
                  className="button submit-button"
                  text={isEditing ? "Update Employee" : "Add Employee"}
                  type="success"
                  onClick={onSubmit}
                />
                {isEditing && (
                  <Button
                    className="button cancel-button"
                    text="Cancel"
                    onClick={onCancelEdit}
                  />
                )}
                <Button
                  className="button reset-button"
                  text="Reset Form"
                  onClick={resetForm}
                />
              </div>
            )}
          />
        </GroupItem>
      </Form>

      {/* Employees Table */}
      <div className="employees-table-container">
        <h2>Employees List</h2>
        <DataGrid
          dataSource={employees}
          showBorders={true}
          focusedRowEnabled={true}
          columnAutoWidth={true}
          columnHidingEnabled={true}
          keyExpr="ID"
          remoteOperations={false}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={true} />
          <Editing
            mode="popup"
            allowUpdating={false}
            allowDeleting={true}
            confirmDelete={true}
          />

          {/* <Toolbar>
            <GridItem name="addRowButton" visible={false} />
            <GridItem name="saveButton" />
            <GridItem name="cancelButton" />
            <GridItem name="deleteButton" />
          </Toolbar> */}

          <Column dataField="ID" width={70} caption="ID" />
          <Column dataField="FirstName" caption="First Name" />
          <Column dataField="LastName" caption="Last Name" />
          <Column dataField="Position" caption="Position" />
          <Column dataField="Email" caption="Email" />
          <Column dataField="Phone" caption="Phone" />
          <Column dataField="HireDateDisplay" caption="Hire Date" />
          <Column dataField="BirthDateDisplay" caption="Birth Date" />
          <Column dataField="Address" caption="Address" />
          <Column dataField="CreatedAt" caption="Created" />
          <Column dataField="UpdatedAt" caption="Updated" />
          <Column
            type="buttons"
            width={100}
            buttons={[
              {
                hint: "Edit",
                icon: "edit",
                onClick: (e) => e.row && onEditEmployee(e.row.data),
              },
              {
                hint: "Delete",
                icon: "trash",
                onClick: (e) => e.row && onDeleteEmployee(e.row.data.ID),
              },
            ]}
          />
        </DataGrid>
      </div>

      {/* Employees Card View */}
      <div className="employees-card-container">
        <h2>Employees Card View</h2>
        <CardView
          dataSource={employees}
          keyExpr="ID"
          cardMinWidth={300}
          cardsPerRow="auto"
        >
          <CardPaging pageSize={6} />
          <HeaderFilter visible={true} />
          <SearchPanel visible={true} />
          <Selection mode="single" />

          <CardCover
            imageExpr={({ FirstName, LastName }: Employee) =>
              `https://via.placeholder.com/300x200/4CAF50/white?text=${FirstName}+${LastName}`
            }
            altExpr={({ FirstName, LastName }: Employee) =>
              `Photo of ${FirstName} ${LastName}`
            }
          />

          <CardColumn
            caption="Full Name"
            calculateFieldValue={({ FirstName, LastName }: Employee) =>
              `${FirstName} ${LastName}`
            }
            allowSorting={true}
            allowFiltering={true}
          />
          <CardColumn dataField="Position" caption="Position" />
          <CardColumn dataField="Email" caption="Email" />
          <CardColumn dataField="Phone" caption="Phone" />
          <CardColumn
            caption="Hire Date"
            dataField="HireDateDisplay"
            allowSorting={true}
          />
          <CardColumn
            caption="Birth Date"
            dataField="BirthDateDisplay"
            allowSorting={true}
          />
          <CardColumn dataField="Address" caption="Address" />
        </CardView>
      </div>
    </div>
  );
}
