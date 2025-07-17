export interface Employee {
  ID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  BirthDate: string | Date;
  HireDate: [Date | null, Date | null];
  Notes: string;
  Address: string;
  Phone: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  HireDateDisplay?: string;
  BirthDateDisplay?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

const defaultEmployee: Employee = {
  ID: 1,
  FirstName: "John",
  LastName: "Heart",
  Position: "CEO",
  BirthDate: "1964/03/16",
  HireDate: [null, null],
  Notes:
    "John has been in the Audio/Video industry since 1990. He has led DevAv as its CEO since 2003.\r\n\r\nWhen not working hard as the CEO, John loves to golf and bowl. He once bowled a perfect game of 300.",
  Address: "351 S Hill St., Los Angeles, CA",
  Phone: "360-684-1334",
  Email: "jheart@dx-email.com",
  Password: "",
  ConfirmPassword: "",
};

const positions = [
  "HR Manager",
  "IT Manager",
  "CEO",
  "Controller",
  "Sales Manager",
  "Support Manager",
  "Shipping Manager",
];

// In-memory storage for employees
let employees: Employee[] = [];

// Initialize with default employee
employees.push({ ...defaultEmployee });

let nextId = 2;

const service = {
  getEmployee() {
    return {
      ...defaultEmployee,
      ID: 0,
      FirstName: "",
      LastName: "",
      Position: "",
      BirthDate: "",
      HireDate: [null, null] as [Date | null, Date | null],
      Notes: "",
      Address: "",
      Phone: "",
      Email: "",
      Password: "",
      ConfirmPassword: "",
    };
  },

  getPositions() {
    return positions;
  },

  getAllEmployees() {
    return [...employees];
  },

  addEmployee(employee: Employee) {
    const newEmployee = {
      ...employee,
      ID: nextId++,
      // Format hire date for display
      HireDateDisplay:
        employee.HireDate && employee.HireDate[0] && employee.HireDate[1]
          ? `${employee.HireDate[0].toLocaleDateString()} - ${employee.HireDate[1].toLocaleDateString()}`
          : "Not specified",
      // Format birth date for display
      BirthDateDisplay: employee.BirthDate
        ? new Date(employee.BirthDate).toLocaleDateString()
        : "Not specified",
      CreatedAt: new Date().toLocaleString(),
    };

    employees.push(newEmployee);
    return newEmployee;
  },

  updateEmployee(id: number, employee: Partial<Employee>) {
    const index = employees.findIndex((emp) => emp.ID === id);
    if (index !== -1) {
      employees[index] = {
        ...employees[index],
        ...employee,
        ID: id,
        HireDateDisplay:
          employee.HireDate && employee.HireDate[0] && employee.HireDate[1]
            ? `${employee.HireDate[0].toLocaleDateString()} - ${employee.HireDate[1].toLocaleDateString()}`
            : "Not specified",
        BirthDateDisplay: employee.BirthDate
          ? new Date(employee.BirthDate).toLocaleDateString()
          : "Not specified",
        UpdatedAt: new Date().toLocaleString(),
      };
      return employees[index];
    }
    return null;
  },

  deleteEmployee(id: number) {
    const index = employees.findIndex((emp) => emp.ID === id);
    if (index !== -1) {
      employees.splice(index, 1);
      return true;
    }
    return false;
  },

  getEmployeeById(id: number) {
    return employees.find((emp) => emp.ID === id) || null;
  },

  resetEmployees() {
    employees = [];
    employees.push({ ...defaultEmployee });
    nextId = 2;
  },
};

export default service;
