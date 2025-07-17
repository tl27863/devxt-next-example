### Specifying a Data Source

You create a `DataSource` instance by passing configuration options

#### In-Memory Data (ArrayStore)

For small, static datasets, you can directly pass an array to the `DataSource` constructor. This implicitly creates an `ArrayStore`.

```jsx
import React from 'react';
import List from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source'; // Import DataSource

import 'devextreme/dist/css/dx.light.css';

const employees = [
    { ID: 1, FirstName: 'John', LastName: 'Doe', City: 'New York' },
    { ID: 2, FirstName: 'Jane', LastName: 'Smith', City: 'London' },
    { ID: 3, FirstName: 'Peter', LastName: 'Jones', City: 'Paris' },
    { ID: 4, FirstName: 'Alice', LastName: 'Brown', City: 'New York' },
];

const inMemoryDataSource = new DataSource(employees);

class App extends React.Component {
    render() {
        return (
            <div>
                <h2>In-Memory Data</h2>
                <List
                    dataSource={inMemoryDataSource}
                    displayExpr="FirstName"
                />
            </div>
        );
    }
}
export default App;
```

#### Custom Data Sources (CustomStore)

When you need to load and process data from any custom API or service not supported out-of-the-box, you use `CustomStore`. This is the most flexible option.

You define `CustomStore` by implementing functions like `load`, `insert`, `update`, `remove`, and `byKey`.

```jsx
import React from 'react';
import DataGrid, { RemoteOperations } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store'; // Import CustomStore

import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch'; // For fetch API support

// Helper function for error handling
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// Function to check if a value is not empty
const isNotEmpty = (value) => value !== undefined && value !== null && value !== '';

// --- Client-Side Data Processing with CustomStore ---
// (Not recommended for large datasets)
const clientSideCustomDataSource = new CustomStore({
    key: 'ID',
    loadMode: 'raw', // Important for client-side processing in most components (except DataGrid, TreeList, PivotGrid, Scheduler)
    load: () => {
        // In client-side mode, fetch ALL data at once
        return fetch('https://jsonplaceholder.typicode.com/posts') // Example public API
            .then(handleErrors)
            .then(response => response.json())
            .catch(() => { throw 'Network error or data fetch failed' });
    }
});

// --- Server-Side Data Processing with CustomStore ---
// (Recommended for large datasets and complex operations)
const serverSideCustomDataSource = new CustomStore({
    key: 'id', // Use 'id' as key for jsonplaceholder posts
    load: (loadOptions) => {
        let params = '?';

        // Iterate through loadOptions to build query parameters for the server
        [
            'filter', 'group', 'groupSummary', 'parentIds', 'requireGroupCount',
            'requireTotalCount', 'searchExpr', 'searchOperation', 'searchValue',
            'select', 'sort', 'skip', 'take', 'totalSummary', 'userData'
        ].forEach(function(i) {
            if (i in loadOptions && isNotEmpty(loadOptions[i])) {
                // Stringify complex objects like filter, sort, group
                params += `${i}=${JSON.stringify(loadOptions[i])}&`;
            }
        });
        params = params.slice(0, -1); // Remove trailing '&'

        // Example: Using jsonplaceholder for demonstration, it doesn't support all params
        // You would typically point this to your own backend service
        const apiUrl = `https://jsonplaceholder.typicode.com/posts${params}`;

        return fetch(apiUrl)
            .then(handleErrors)
            .then(response => response.json())
            .then(response => {
                // For jsonplaceholder, it returns all data, we simulate server-side processing
                // In a real scenario, your server would apply filter/sort/skip/take
                const data = response; // jsonplaceholder returns array directly

                // Simulate totalCount and data based on simple pagination
                const totalCount = 100; // Assume 100 total posts
                const skip = loadOptions.skip || 0;
                const take = loadOptions.take || data.length; // If take is not specified, take all

                return {
                    data: data.slice(skip, skip + take), // Simulate server-side paging
                    totalCount: totalCount, // Required if requireTotalCount is true
                    // summary: [], // If totalSummary is requested
                    // groupCount: 0 // If requireGroupCount is true
                };
            })
            .catch(() => { throw 'Network error or data fetch failed' });
    },
    // byKey is crucial for components like SelectBox, Lookup, Autocomplete, DropDownBox
    // to fetch a single item by its key (e.g., when an item is pre-selected)
    byKey: (key) => {
        return fetch(`https://jsonplaceholder.typicode.com/posts/${key}`)
            .then(handleErrors)
            .then(response => response.json());
    }
});

class App extends React.Component {
    render() {
        return (
            <div>
                <h2>Server-Side DataGrid Example</h2>
                <DataGrid
                    dataSource={serverSideCustomDataSource}
                    showBorders={true}
                    allowColumnResizing={true}
                    allowColumnReordering={true}
                >
                    {/* RemoteOperations is essential for DataGrid, TreeList, PivotGridDataSource
                        to inform them that data shaping (sorting, filtering, paging)
                        is handled by the server. */}
                    <RemoteOperations
                        sorting={true}
                        paging={true}
                        filtering={true}
                        grouping={true}
                        summary={true}
                    />
                </DataGrid>
            </div>
        );
    }
}
export default App;
```

#### Remote Data (using `createStore` for specific backends)

DevExtreme provides extensions for common backend technologies (like ASP.NET Core, PHP, MongoDB) that implement the DevExtreme data protocol. For these, you can use the `createStore` method from `devextreme-aspnet-data-nojquery` (or similar packages) for a more streamlined setup.

```jsx
import React from 'react';
import DataGrid, { RemoteOperations } from 'devextreme-react/data-grid';
import { createStore } from 'devextreme-aspnet-data-nojquery'; // For .NET backends

import 'devextreme/dist/css/dx.light.css';

// This URL would point to your ASP.NET Core API endpoint
const serviceUrl = 'https://mydomain.com/MyDataService'; // Replace with your actual service URL

const remoteDataSourceWithCreateStore = createStore({
    key: 'ID', // The unique key field for your data
    loadUrl: serviceUrl + '/GetAction', // Endpoint for reading data
    insertUrl: serviceUrl + '/InsertAction', // Endpoint for inserting data
    updateUrl: serviceUrl + '/UpdateAction', // Endpoint for updating data
    deleteUrl: serviceUrl + '/DeleteAction' // Endpoint for deleting data
    // Other options like batch (for batch updates), onBeforeSend, etc.
});

class App extends React.Component {
    render() {
        return (
            <div>
                <h2>Remote DataGrid (using createStore)</h2>
                <DataGrid
                    dataSource={remoteDataSourceWithCreateStore}
                    showBorders={true}
                >
                    {/* RemoteOperations is crucial here as well */}
                    <RemoteOperations
                        sorting={true}
                        paging={true}
                        filtering={true}
                        grouping={true}
                        summary={true}
                    />
                </DataGrid>
            </div>
        );
    }
}
// export default App; // Uncomment to use this example
```

### Reading Data

Once a `DataSource` is configured, you can explicitly load data using the `load()` method. This method returns a Promise.

```javascript
// Assuming 'myDataSource' is an instance of DevExpress.data.DataSource
myDataSource.load()
    .then(result => {
        // 'result' contains the array of data items
        console.log("Data loaded:", result);
    })
    .catch(error => {
        // Handle any errors during data loading
        console.error("Error loading data:", error);
    });
```

When a DevExtreme UI component is bound to a `DataSource` (e.g., `<List dataSource={myDataSource} />`), the component automatically calls `load()` internally when it needs data.

### Paging

`DataSource` supports client-side and server-side paging.

*   **`pageSize`**: Determines the number of items per page.
*   **`pageIndex()`**: Gets the current zero-based page index.
*   **`pageIndex(newIndex)`**: Sets the current page index. You must call `load()` afterward for the change to take effect.
*   **`paginate: false`**: Disables paging, loading all data at once.

```jsx
import React from 'react';
import List from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import Button from 'devextreme-react/button';

import 'devextreme/dist/css/dx.light.css';

const products = Array.from({ length: 50 }, (_, i) => ({
    ID: i + 1,
    Name: `Product ${i + 1}`,
    Price: (i + 1) * 10
}));

class PagingExample extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new DataSource({
            store: products,
            pageSize: 5, // 5 items per page
            paginate: true // Enable paging (default is true)
        });

        this.state = {
            currentPage: this.dataSource.pageIndex()
        };
    }

    componentDidMount() {
        this.dataSource.load().then(() => {
            this.setState({ currentPage: this.dataSource.pageIndex() });
        });
    }

    goToNextPage = () => {
        if (this.dataSource.pageIndex() < this.dataSource.pageCount() - 1) {
            this.dataSource.pageIndex(this.dataSource.pageIndex() + 1);
            this.dataSource.load().then(() => {
                this.setState({ currentPage: this.dataSource.pageIndex() });
            });
        }
    }

    goToPrevPage = () => {
        if (this.dataSource.pageIndex() > 0) {
            this.dataSource.pageIndex(this.dataSource.pageIndex() - 1);
            this.dataSource.load().then(() => {
                this.setState({ currentPage: this.dataSource.pageIndex() });
            });
        }
    }

    render() {
        return (
            <div>
                <h2>Paging Example</h2>
                <List
                    dataSource={this.dataSource}
                    displayExpr="Name"
                />
                <div style={{ marginTop: '10px' }}>
                    <Button text="Previous" onClick={this.goToPrevPage} />
                    <span style={{ margin: '0 10px' }}>
                        Page {this.state.currentPage + 1} of {this.dataSource.pageCount()}
                    </span>
                    <Button text="Next" onClick={this.goToNextPage} />
                </div>
            </div>
        );
    }
}
// export default PagingExample; // Uncomment to use this example
```

### Sorting

You can specify sorting conditions using the `sort` configuration property during `DataSource` creation or dynamically with the `sort(sortExpr)` method.

**`sortExpr` Syntax:**

*   **Single Field (Ascending):** `"fieldName"`
    ```javascript
    dataSource.sort("Price");
    ```
*   **Single Field (Descending):** `{ field: "fieldName", desc: true }` or `{ getter: "fieldName", desc: true }`
    ```javascript
    dataSource.sort({ field: "Price", desc: true });
    ```
*   **Custom Sort Function:**
    ```javascript
    dataSource.sort(function(item) {
        // Custom logic, e.g., sort by length of name
        return item.Name.length;
    });
    ```
*   **Multiple Fields:** An array of sort expressions.
    ```javascript
    dataSource.sort([
        "Category", // Sort by Category ascending
        { field: "Price", desc: true } // Then by Price descending
    ]);
    ```

**Important:** After calling `dataSource.sort()`, you must call `dataSource.load()` for the changes to apply.

```jsx
import React from 'react';
import List from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import Button from 'devextreme-react/button';

import 'devextreme/dist/css/dx.light.css';

const items = [
    { ID: 1, Name: 'Apple', Category: 'Fruit', Price: 1.20 },
    { ID: 2, Name: 'Banana', Category: 'Fruit', Price: 0.80 },
    { ID: 3, Name: 'Carrot', Category: 'Vegetable', Price: 0.50 },
    { ID: 4, Name: 'Orange', Category: 'Fruit', Price: 1.50 },
    { ID: 5, Name: 'Broccoli', Category: 'Vegetable', Price: 1.00 },
];

class SortingExample extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new DataSource(items);
    }

    sortByNameAsc = () => {
        this.dataSource.sort("Name");
        this.dataSource.load(); // Reload data with new sort
    }

    sortByPriceDesc = () => {
        this.dataSource.sort({ field: "Price", desc: true });
        this.dataSource.load(); // Reload data with new sort
    }

    sortByCategoryAndName = () => {
        this.dataSource.sort([
            "Category",
            "Name"
        ]);
        this.dataSource.load(); // Reload data with new sort
    }

    render() {
        return (
            <div>
                <h2>Sorting Example</h2>
                <div style={{ marginBottom: '10px' }}>
                    <Button text="Sort by Name (A-Z)" onClick={this.sortByNameAsc} />
                    <Button text="Sort by Price (High-Low)" onClick={this.sortByPriceDesc} style={{ marginLeft: '10px' }} />
                    <Button text="Sort by Category, then Name" onClick={this.sortByCategoryAndName} style={{ marginLeft: '10px' }} />
                </div>
                <List
                    dataSource={this.dataSource}
                    displayExpr="Name"
                    itemRender={(data) => (
                        <div>
                            <strong>{data.Name}</strong> ({data.Category}) - ${data.Price.toFixed(2)}
                        </div>
                    )}
                />
            </div>
        );
    }
}
// export default SortingExample; // Uncomment to use this example
```

### Filtering

You can apply filters using the `filter` configuration property or the `filter(filterExpr)` method.

**`filterExpr` Syntax:**

*   **Binary Operation:** `["fieldName", "operator", value]`
    *   **Operators:** `=`, `<>`, `>`, `>=`, `<`, `<=`, `startswith`, `endswith`, `contains`, `notcontains`.
    *   Example: `["Price", ">", 1.00]`
    *   Shorthand for `=`: `["Price", 1.20]` (operator is optional, defaults to `=`)
*   **Unary (NOT) Operation:** `["!", ["fieldName", "operator", value]]`
    *   Example: `["!", ["Category", "=", "Fruit"]]` (items that are NOT Fruit)
*   **Group Operations (AND/OR):** Combine multiple conditions using `"and"` or `"or"`.
    *   Example: `[["Price", ">", 0.50], "and", ["Category", "=", "Fruit"]]`
    *   Implied "and": If you list conditions without an operator between them, `"and"` is assumed.
        `[["Price", ">", 0.50], ["Category", "=", "Fruit"]]` is equivalent to the above.
    *   Operator Priority: Use nested arrays for explicit priority.
        `[["Name", "contains", "a"], "and", [["Price", "<", 1.00], "or", ["Price", ">", 1.50]]]`
*   **Custom Filter Function:** A function that takes an item and returns `true` if it matches the filter, `false` otherwise.
    ```javascript
    dataSource.filter(function(itemData) {
        return itemData.Name.length > 5 && itemData.Price < 1.00;
    });
    ```

**Important:** After calling `dataSource.filter()`, you must call `dataSource.load()` for the changes to apply.

```jsx
import React from 'react';
import List from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import Button from 'devextreme-react/button';

import 'devextreme/dist/css/dx.light.css';

const items = [
    { ID: 1, Name: 'Apple', Category: 'Fruit', Price: 1.20 },
    { ID: 2, Name: 'Banana', Category: 'Fruit', Price: 0.80 },
    { ID: 3, Name: 'Carrot', Category: 'Vegetable', Price: 0.50 },
    { ID: 4, Name: 'Orange', Category: 'Fruit', Price: 1.50 },
    { ID: 5, Name: 'Broccoli', Category: 'Vegetable', Price: 1.00 },
    { ID: 6, Name: 'Grapes', Category: 'Fruit', Price: 2.50 },
    { ID: 7, Name: 'Spinach', Category: 'Vegetable', Price: 0.75 },
];

class FilteringExample extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new DataSource(items);
    }

    filterFruits = () => {
        this.dataSource.filter(["Category", "=", "Fruit"]);
        this.dataSource.load();
    }

    filterCheapItems = () => {
        this.dataSource.filter(["Price", "<", 1.00]);
        this.dataSource.load();
    }

    filterExpensiveFruits = () => {
        this.dataSource.filter([
            ["Category", "=", "Fruit"],
            "and",
            ["Price", ">", 1.00]
        ]);
        this.dataSource.load();
    }

    clearFilter = () => {
        this.dataSource.filter(null); // Clear all filters
        this.dataSource.load();
    }

    render() {
        return (
            <div>
                <h2>Filtering Example</h2>
                <div style={{ marginBottom: '10px' }}>
                    <Button text="Show Fruits" onClick={this.filterFruits} />
                    <Button text="Show Cheap Items (< $1)" onClick={this.filterCheapItems} style={{ marginLeft: '10px' }} />
                    <Button text="Show Expensive Fruits (> $1)" onClick={this.filterExpensiveFruits} style={{ marginLeft: '10px' }} />
                    <Button text="Clear Filter" onClick={this.clearFilter} style={{ marginLeft: '10px' }} />
                </div>
                <List
                    dataSource={this.dataSource}
                    displayExpr="Name"
                    itemRender={(data) => (
                        <div>
                            <strong>{data.Name}</strong> ({data.Category}) - ${data.Price.toFixed(2)}
                        </div>
                    )}
                />
            </div>
        );
    }
}
// export default FilteringExample; // Uncomment to use this example
```

#### Create a Basic DataGrid

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css'; // Import DevExtreme theme

import {
    DataGrid // Import the DataGrid component
} from 'devextreme-react/data-grid';

function App() {
    return (
        <div className="App">
            <h1>My DataGrid Application</h1>
            <DataGrid id="myGrid">
                {/* DataGrid configuration and columns will go here */}
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Bind the DataGrid to Data

The `dataSource` property is used to bind the DataGrid to data. For local arrays, also specify `keyExpr` for unique row identification. For remote data, you'll typically use a `DataSource` instance with a `CustomStore` or `createStore`.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid
} from 'devextreme-react/data-grid';

// Sample local data (e.g., from a separate employees.js file)
const employees = [
    { EmployeeID: 1, FullName: 'John Doe', Position: 'CEO', BirthDate: '1970-01-15', HireDate: '1995-03-01', City: 'New York', Country: 'USA', Address: '123 Main St', HomePhone: '555-1234', PostalCode: '10001' },
    { EmployeeID: 2, FullName: 'Jane Smith', Position: 'CTO', BirthDate: '1975-05-20', HireDate: '1998-07-10', City: 'London', Country: 'UK', Address: '45 Park Lane', HomePhone: '555-5678', PostalCode: 'SW1A 0AA' },
    { EmployeeID: 3, FullName: 'Peter Jones', Position: 'CFO', BirthDate: '1980-11-01', HireDate: '2005-09-15', City: 'Paris', Country: 'France', Address: '789 Rue de la Paix', HomePhone: '555-9012', PostalCode: '75001' },
    { EmployeeID: 4, FullName: 'Alice Brown', Position: 'Manager', BirthDate: '1985-03-25', HireDate: '2010-01-05', City: 'New York', Country: 'USA', Address: '321 Broadway', HomePhone: '555-3456', PostalCode: '10007' },
];

function App() {
    return (
        <div className="App">
            <h1>Employee DataGrid</h1>
            <DataGrid
                dataSource={employees} // Bind to local data
                keyExpr="EmployeeID" // Specify the unique key field
                showBorders={true} // Add borders for better visibility
            >
                {/* Columns will be auto-generated if not specified */}
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Customize Columns

You can control column order, visibility, width, data type, and more using the `Column` component.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column, // Import Column component
    ColumnFixing, // For fixed columns
    ColumnChooser // For column chooser
} from 'devextreme-react/data-grid';

const employees = [ /* ... same employees data as above ... */ ];

function App() {
    return (
        <div className="App">
            <h1>Customized Employee DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
                allowColumnReordering={true} // Allow users to reorder columns
                columnAutoWidth={true} // Columns adjust width to content
                allowColumnResizing={true} // Allow users to resize columns
            >
                {/* Reorder columns by changing their order here */}
                <Column dataField="FullName" fixed={true}></Column> {/* Fixed to left */}
                <Column dataField="Position"></Column>
                <Column
                    dataField="BirthDate"
                    dataType="date" // Treat as date-time value
                    width={120} // Set specific width
                ></Column>
                <Column
                    dataField="HireDate"
                    dataType="date"
                    width={120}
                ></Column>
                <Column dataField="City" />
                <Column dataField="Country"></Column>
                <Column dataField="Address" visible={false} /> {/* Hidden by default */}
                <Column dataField="HomePhone" />
                <Column dataField="PostalCode" visible={false} />

                <ColumnFixing enabled={true} /> {/* Enable column fixing UI */}
                <ColumnChooser enabled={true} /> {/* Enable column chooser UI */}
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Sort Data

Configure initial sorting using `sortOrder` and `sortIndex` on `Column`. The `Sorting` component can control sorting mode (single/multiple).

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    Sorting // For global sorting options
} from 'devextreme-react/data-grid';

const employees = [ /* ... */ ];

function App() {
    return (
        <div className="App">
            <h1>Sorted Employee DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column
                    dataField="Country"
                    sortOrder="asc" // Initial sort by Country ascending
                    sortIndex={0} // Primary sort column
                ></Column>
                <Column
                    dataField="HireDate"
                    dataType="date"
                    sortOrder="desc" // Secondary sort by HireDate descending
                    sortIndex={1}
                ></Column>
                {/* <Sorting mode="multiple" /> */} {/* Uncomment for multiple sorting */}
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Filter and Search Data

Add `FilterRow` and `SearchPanel` components to enable filtering and searching capabilities.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    FilterRow, // For filter row
    SearchPanel // For search panel
} from 'devextreme-react/data-grid';

const employees = [ /* ... */ ];

function App() {
    return (
        <div className="App">
            <h1>Filterable/Searchable Employee DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <FilterRow visible={true} applyFilter="auto" /> {/* Enable filter row */}
                <SearchPanel visible={true} highlightSearchText={true} /> {/* Enable search panel */}

                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column dataField="Country"></Column>
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Group Data

Enable the `GroupPanel` and specify `groupIndex` on `Column` to group data.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    GroupPanel // For group panel
} from 'devextreme-react/data-grid';

const employees = [ /* ... */ ];

function App() {
    return (
        <div className="App">
            <h1>Grouped Employee DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <GroupPanel visible={true} /> {/* Enable group panel */}

                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column
                    dataField="Country"
                    groupIndex={0} // Group by Country
                ></Column>
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Edit and Validate Data

Configure the `Editing` component to enable adding, updating, and deleting rows. Add `RequiredRule` (or other validation rules) to `Column` components.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    Editing, // For editing functionality
    RequiredRule // For validation
} from 'devextreme-react/data-grid';

const employees = [ /* ... */ ];

function App() {
    return (
        <div className="App">
            <h1>Editable Employee DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <Editing
                    mode="popup" // Use popup edit mode
                    allowUpdating={true}
                    allowDeleting={true}
                    allowAdding={true}
                />

                <Column dataField="FullName">
                    <RequiredRule message="Full Name is required" />
                </Column>
                <Column dataField="Position">
                    <RequiredRule message="Position is required" />
                </Column>
                <Column dataField="BirthDate" dataType="date">
                    <RequiredRule message="Birth Date is required" />
                </Column>
                <Column dataField="HireDate" dataType="date">
                    <RequiredRule message="Hire Date is required" />
                </Column>
                <Column dataField="City"></Column>
                <Column dataField="Country">
                    <RequiredRule message="Country is required" />
                </Column>
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Select Records

Use the `Selection` component to enable row selection and handle `onSelectionChanged` event.

```jsx
import React, { useCallback, useState } from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    Selection // For row selection
} from 'devextreme-react/data-grid';

const employees = [ /* ... */ ];

function SelectedEmployeeInfo(props) {
    if (props.employee) {
        return (
            <p style={{ marginTop: '10px', fontSize: '1.1em' }}>
                Selected employee: <strong>{props.employee.FullName}</strong> ({props.employee.Position})
            </p>
        );
    }
    return null;
}

function App() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const onSelectionChanged = useCallback((e) => {
        // e.currentSelectedRowKeys contains keys of newly selected rows
        if (e.currentSelectedRowKeys.length > 0) {
            // Use byKey to get the full data object for the selected row
            e.component.byKey(e.currentSelectedRowKeys[0]).then(employee => {
                setSelectedEmployee(employee);
            });
        } else {
            setSelectedEmployee(null);
        }
    }, []);

    return (
        <div className="App">
            <h1>Selectable Employee DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
                onSelectionChanged={onSelectionChanged}
            >
                <Selection mode="single" /> {/* Enable single row selection */}

                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column dataField="Country"></Column>
            </DataGrid>
            <SelectedEmployeeInfo employee={selectedEmployee} />
        </div>
    );
}

export default App;
```

#### Display Summaries

Add `Summary` and `GroupItem`/`TotalItem` components to calculate and display aggregate values.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    GroupPanel,
    Summary, // For summaries
    GroupItem, // For group summaries
    TotalItem // For total summaries
} from 'devevextreme-react/data-grid';

const employees = [ /* ... */ ];

function App() {
    return (
        <div className="App">
            <h1>DataGrid with Summaries</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <GroupPanel visible={true} />

                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column
                    dataField="Country"
                    groupIndex={0} // Group by Country
                ></Column>

                <Summary>
                    {/* Group Summary: Count employees in each country group */}
                    <GroupItem
                        column="FullName" // Column to display summary under
                        summaryType="count"
                        displayFormat="Employees: {0}"
                    />
                    {/* Total Summary: Total count of all employees */}
                    <TotalItem
                        column="FullName"
                        summaryType="count"
                        displayFormat="Total Employees: {0}"
                    />
                </Summary>
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Customize the Toolbar

Use the `Toolbar` and `Item` components to add predefined or custom controls to the DataGrid's toolbar.

```jsx
import React, { useState, useRef, useCallback } from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    Grouping, // For autoExpandAll
    Toolbar,
    Item // For toolbar items
} from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button'; // Example custom component

const employees = [ /* ... */ ];

function App() {
    const dataGridRef = useRef(null);
    const [expanded, setExpanded] = useState(true);

    const toggleExpandAll = useCallback(() => {
        setExpanded(prevExpanded => !prevExpanded);
    }, []);

    return (
        <div className="App">
            <h1>DataGrid with Custom Toolbar</h1>
            <DataGrid
                ref={dataGridRef}
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <Grouping autoExpandAll={expanded} /> {/* Controls group expansion */}

                <Toolbar>
                    <Item name="groupPanel" /> {/* Predefined group panel */}
                    <Item location="after"> {/* Custom button after default items */}
                        <Button
                            text={expanded ? 'Collapse All' : 'Expand All'}
                            width={136}
                            onClick={toggleExpandAll}
                        />
                    </Item>
                    <Item name="addRowButton" showText="always" /> {/* Add row button */}
                    <Item name="exportButton" /> {/* Export button (requires export setup) */}
                    <Item name="columnChooserButton" /> {/* Column chooser button */}
                    <Item name="searchPanel" /> {/* Search panel */}
                </Toolbar>

                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column dataField="Country" groupIndex={0}></Column>
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Configure Master-Detail Interface

Use `MasterDetail` and specify a `component` prop that renders the detail section.

```jsx
import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import './App.css'; // For employee-photo and employee-notes styles

import {
    DataGrid,
    Column,
    MasterDetail // For master-detail view
} from 'devextreme-react/data-grid';

const employees = [
    // ... include Photo and Notes fields in your employee data
    { EmployeeID: 1, FullName: 'John Doe', Position: 'CEO', BirthDate: '1970-01-15', HireDate: '1995-03-01', City: 'New York', Country: 'USA', Address: '123 Main St', HomePhone: '555-1234', PostalCode: '10001', Photo: 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/01.png', Notes: 'John is the visionary leader of our company...' },
    { EmployeeID: 2, FullName: 'Jane Smith', Position: 'CTO', BirthDate: '1975-05-20', HireDate: '1998-07-10', City: 'London', Country: 'UK', Address: '45 Park Lane', HomePhone: '555-5678', PostalCode: 'SW1A 0AA', Photo: 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/02.png', Notes: 'Jane leads our technology and innovation efforts...' },
    // ... more employees
];

// Detail component receives props.data.data which is the master row's data
function DetailSection(props) {
    const employee = props.data.data;
    return (
        <div className="master-detail-container">
            <img
                className="employee-photo"
                alt={employee.FullName}
                src={employee.Photo}
                style={{ width: '100px', height: '100px', borderRadius: '50%', float: 'left', marginRight: '15px' }}
            />
            <div className="employee-details">
                <h3>{employee.FullName}</h3>
                <p><strong>Position:</strong> {employee.Position}</p>
                <p><strong>City:</strong> {employee.City}, {employee.Country}</p>
                <p><strong>Notes:</strong> {employee.Notes}</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <h1>Master-Detail DataGrid</h1>
            <DataGrid
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
            >
                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column dataField="Country"></Column>

                <MasterDetail
                    enabled={true} // Enable master-detail
                    component={DetailSection} // Component to render detail content
                />
            </DataGrid>
        </div>
    );
}

export default App;
```

#### Export Data

Install `exceljs`, `file-saver`, and `jspdf`. Then, use the `onExporting` event to trigger the export logic.

```bash
npm install --save exceljs file-saver
npm install jspdf
```

```jsx
import React, { useCallback, useRef } from 'react';
import 'devextreme/dist/css/dx.light.css';

import {
    DataGrid,
    Column,
    Export // For export functionality
} from 'devextreme-react/data-grid';

import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter'; // For PDF export
import { exportDataGrid } from 'devextreme/excel_exporter'; // For Excel export
import { Workbook } from 'exceljs'; // From exceljs
import { saveAs } from 'file-saver'; // From file-saver
import { jsPDF } from 'jspdf'; // From jspdf

const employees = [ /* ... */ ];

function App() {
    const dataGridRef = useRef(null);

    const onExporting = useCallback((e) => {
        if (e.format === 'xlsx') {
            const workbook = new Workbook();
            const worksheet = workbook.addWorksheet('Employees');

            exportDataGrid({
                component: e.component,
                worksheet,
                autoFilterEnabled: true,
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Employees.xlsx');
                });
            });
        } else if (e.format === 'pdf') {
            const doc = new jsPDF();
            exportDataGridToPdf({
                component: e.component,
                jsPDFDocument: doc,
            }).then(() => {
                doc.save('Employees.pdf');
            });
        }
    }, []);

    return (
        <div className="App">
            <h1>Exportable DataGrid</h1>
            <DataGrid
                ref={dataGridRef}
                dataSource={employees}
                keyExpr="EmployeeID"
                showBorders={true}
                onExporting={onExporting} // Handle export event
            >
                <Export enabled={true} formats={['xlsx', 'pdf']} allowExportSelectedData={true} /> {/* Enable export button */}

                <Column dataField="FullName"></Column>
                <Column dataField="Position"></Column>
                <Column dataField="City"></Column>
                <Column dataField="Country"></Column>
            </DataGrid>
        </div>
    );
}

export default App;
```
