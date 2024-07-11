import * as React from "react";
import { ReactGrid, Column, Row, CellChange, DefaultCellTypes, CellTemplate, Cell, Compatible, Uncertain, Id } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import { DropdownCell, DropdownCellTemplate } from "@silevis/reactgrid";

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

const getRows = (people: Person[], openDropdownIndex: number | null): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx.toString(),
    cells: [
      {
        type: "dropdown",
        selectedValue: person.name,
        inputValue: person.name,
        isOpen: openDropdownIndex === idx,
        values: nameOptions,
        rowId: idx.toString(),
        columnId: "name"
      } as DropdownCell & { rowId: string; columnId: Id },
      { type: "text", text: person.surname }
    ]
  }))
];

// Extend DropdownCell to include rowId and columnId
interface ExtendedDropdownCell extends DropdownCell {
  rowId: string;
  columnId: Id;
}

// Custom DropdownCellTemplate
class CustomDropdownCellTemplate extends DropdownCellTemplate {
  onClick: (cell: ExtendedDropdownCell, rowIndex: number, columnId: Id) => void;

  constructor(onClick: (cell: ExtendedDropdownCell, rowIndex: number, columnId: Id) => void) {
    super();
    this.onClick = onClick;
  }

  render(cell: Compatible<ExtendedDropdownCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<DropdownCell>, commit: boolean) => void): React.ReactNode {
    return (
      <div onClick={() => this.onClick(cell as ExtendedDropdownCell, parseInt((cell as ExtendedDropdownCell).rowId), (cell as ExtendedDropdownCell).columnId)}>
        {super.render(cell, isInEditMode, onCellChanged)}
      </div>
    );
  }
}

function App() {
  const [people, setPeople] = React.useState<Person[]>(getPeople());
  const [openDropdownIndex, setOpenDropdownIndex] = React.useState<number | null>(null);
  const [cellData, setCellData] = React.useState<any>(null);

  const rows = getRows(people, openDropdownIndex);
  const columns = getColumns();

  const handleChanges = (changes: CellChange<DefaultCellTypes>[]) => {
    const updatedPeople = [...people];
    let dropdownClosed = false;

    changes.forEach(change => {
      if (change.columnId === "name" && change.rowId !== "header" && change.newCell.type === "dropdown") {
        const personIndex = Number(change.rowId);
        const newValue = (change.newCell as DropdownCell).selectedValue;
        console.log("DROPDOWN : newValue => personIndex : ", newValue , "=>", personIndex);
        if ((updatedPeople[personIndex].name !== newValue) && newValue && (cellData.selectedValue !== newValue)) {
          console.log("cellData : ", cellData);
          updatedPeople[personIndex].name = newValue || "";
          dropdownClosed = true; // Close the dropdown only if a new value is selected
        }
      } else if (change.columnId === "surname" && change.rowId !== "header" && change.newCell.type === "text") {
        const personIndex = Number(change.rowId);
        updatedPeople[personIndex].surname = change.newCell.text;
        console.log("TEXT : newValue => personIndex : ", change.newCell.text , "=>", personIndex);
      }
    });

    setPeople(updatedPeople);
    if (dropdownClosed) {
      setOpenDropdownIndex(null); // Close the dropdown after selection
    }
  };

  const handleOpenDropdown = (rowIndex: number, cell: any) => {
    setOpenDropdownIndex(openDropdownIndex === rowIndex ? null : rowIndex);
    setCellData(cell);
  };

  const cellTemplates = {
    dropdown: new CustomDropdownCellTemplate((cell, rowIndex, columnId) => handleOpenDropdown(rowIndex, cell))
  };

  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      customCellTemplates={cellTemplates}
      onCellsChanged={handleChanges}
    />
  );
}

export default App;
