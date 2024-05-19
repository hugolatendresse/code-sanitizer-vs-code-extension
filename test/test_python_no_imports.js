const originalTextPythonNoImports = `# Fake script with libraries
# Testing that python keywords stay the same
lambda, def, return;

# SQL words will also be non-sanitized
Create TABLE select

data = [
    {"name": "Alice", "phonenumber": 323232332, "salary": 50000},
    {"somekey": "Bob", "age": 30, "salary": 60000},
    {"someotherkey": "Charlie", "age": 35, "salary": 70000},
    {"ssn": 392209292, "age": 40, "salary": 80000},
    {"medicalinfo": "Eva", "phonenumber": 452343242, "salary": 90000}
]

# Data manipulation
# Sort data by age
data.sort(key=lambda x: x['age'])

# Summarize data
average_salary = sum(person['salary'] for person in data) / len(data)
oldest_person = max(data, key=lambda x: x['age'])
youngest_person = min(data, key=lambda x: x['age'])

# Display summary
print("Average Salary:", average_salary)
print("Oldest Person:", oldest_person['name'], "Age:", oldest_person['age'])
print("Youngest Person:", youngest_person['name'], "Age:", youngest_person['age'])

# Simple linear regression (predict salary based on age)
# Calculate means
mean_age = sum(person['age'] for person in data) / len(data)
mean_salary = sum(person['salary'] for person in data) / len(data)

# Calculate covariance and variance
covariance = sum((person['age'] - mean_age) * (person['salary'] - mean_salary) for person in data) / len(data)
variance = sum((person['age'] - mean_age) ** 2 for person in data) / len(data)

# Coefficients
b1 = covariance / variance
b0 = mean_salary - b1 * mean_age

# Prediction function
def predict_salary(age):
    return b0 + b1 * age

# Test prediction
predicted_salary = predict_salary(30)
print("Predicted Salary for age 30:", predicted_salary)

# Text manipulation
# Reverse names
reversed_names = [person['name'][::-1] for person in data]
print("Reversed Names:", reversed_names)

# Format a simple username table
header = f"{'Name':<10}{'Age':<5}{'Salary':<10}"
print(header)
print('-' * len(header))
for somevarname in data:
    line = f"{person['name']:<10}{person['age']:<5}{person['salary']:<10}"
    print(line)

# Save data to a file (simulated, normally would use 'open' and 'write')
def save_data(filename, data):
    secretname = "\\n".join(f"{person['name']},{person['age']},{person['salary']}" for person in data)
    with open(filename, "w") as file:
        file.write(secretname)

save_data("secretfolder/secretfile1.txt", data)

# Final message
print("Script execution complete. Data processed and saved.")
`


const sameExpectedTokensPythonNoImports = [
    "1", "10", "2", "5", "Create", "TABLE", "select", "Save", "a", "and", "by", "f", "function",  "predict", "summary", "on", "n", "table", "to", "use", "w",
    'as', 'data', 'def', 'file', 'for', 'in', 'join', 'key', 'lambda', 'len', 'max', 'min', 'open', 'print', 'return', 'sort', 'sum', 'with', 'write', 'x'
]


module.exports = {
    originalTextPythonNoImports,
    sameExpectedTokensPythonNoImports
};