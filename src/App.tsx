import * as React from "react";
import { render } from "react-dom";
import { ReactGrid, Column, Row, CellChange, DefaultCellTypes } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import { DropdownCell, DropdownCellTemplate } from "@silevis/reactgrid";// assuming the DropdownCellTemplate is defined in this file

interface Person {
  name: string;
  surname: string;
}

const getPeople = (): Person[] => [
  { name: "Thomas", surname: "Goldman" },
  { name: "Susie", surname: "Quattro" },
  { name: "", surname: "" }
];

const getColumns = (): Column[] => [
  { columnId: "name", width: 150 },
  { columnId: "surname", width: 150 }
];

const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "Name" },
    { type: "header", text: "Surname" }
  ]
};

const nameOptions = [
  { label: "Thomas", value: "Thomas" },
  { label: "Susie", value: "Susie" },
  { label: "John", value: "John" },
  { label: "Jane", value: "Jane" }
];

const getRows = (people: Person[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    cells: [
      {
        type: "dropdown",
        selectedValue: person.name,
        values: nameOptions,
      } as DropdownCell,
      { type: "text", text: person.surname }
    ]
  }))
];

function App() {
  const [people, setPeople] = React.useState<Person[]>(getPeople());

  const rows = getRows(people);
  const columns = getColumns();

  const handleChanges = (changes: CellChange<DefaultCellTypes>[]) => {
    const updatedPeople = [...people];
    changes.forEach(change => {
      if (change.columnId === "name" && change.rowId !== "header" && change.newCell.type === "dropdown") {
        const personIndex = Number(change.rowId);
        updatedPeople[personIndex].name = (change.newCell as DropdownCell).selectedValue || "";
      } else if (change.columnId === "surname" && change.rowId !== "header" && change.newCell.type === "text") {
        const personIndex = Number(change.rowId);
        updatedPeople[personIndex].surname = change.newCell.text;
      }
    });
    setPeople(updatedPeople);
  };
  
  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      customCellTemplates={{ dropdown: new DropdownCellTemplate() }}
      onCellsChanged={handleChanges}
    />
  );
}

export default App;
