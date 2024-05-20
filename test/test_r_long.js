const originalTextLongTestR = `# Load necessary libraries
library(dplyr)           # For data manipulation
library(tidyr)           # For data cleaning
library(ggplot2)         # For data visualization
library(readr)           # For reading data
library(lubridate)       # For date manipulation
library(verysecret)      # a custom-made library that should get sanitized
library(caret)           # For model training
library(broom)           # To tidy models
library(AER)             # For actuarial models and methods

# Set random seed for reproducibility
set.seed(123)

# Read in data
data <- read_csv("pathtoyourdata.csv")

# Data Cleaning and Manipulation
data <- data %>%
  filter(!is.na(target_variable)) %>%
  mutate(
    Date = mdy(Date),  # Convert to Date format
    Age = 2024 - birth_year,  # Calculate age from birth year
    Age_Group = cut(Age, breaks = c(0, 25, 50, 75, 100), labels = c("0-24", "25-49", "50-74", "75+"))
  ) %>%
  select(-birth_year) %>%
  group_by(Age_Group) %>%
  summarise(
    Mean_Age = mean(Age, na.rm = TRUE),
    Count = n(),
    Average_Sales = mean(Sales, na.rm = TRUE)
  ) %>%
  ungroup()

# Data Visualization
ggplot(data, aes(x = Age_Group, y = Average_Sales)) +
  geom_bar(stat = "identity", fill = "blue") +
  labs(title = "Average Sales by Age Group", x = "Age Group", y = "Average Sales") +
  theme_minimal()

# Train a Generalized Linear Model (GLM)
set.seed(123)  # Reset seed for model reproducibility
training_index <- createDataPartition(data$target_variable, p = 0.8, list = FALSE)
training_data <- data[training_index, ]
testing_data <- data[-training_index, ]

# Fit the model
glm_model <- glm(target_variable ~ ., data = training_data, family = binomial())

# Model evaluation
predictions <- predict(glm_model, testing_data, type = "response")
confusionMatrix <- table(Predicted = round(predictions), Actual = testing_data$target_variable)

# Print model summary
summary(glm_model)

# Tidy the GLM model results
tidy_results <- tidy(glm_model)
write_csv(tidy_results, "glm_results.csv")

# Save the model to disk
saveRDS(glm_model, file = "glm_model.rds")

# Conclusion message
cat("Model training complete and results saved. Check the glm_results.csv and glm_model.rds files for output.")
`


const sameExpectedTokensLongTestR = [
    "library", "IADDEDTHIS", "dplyr", "tidyr", "ggplot2", "readr", "lubridate", "caret", "broom", "AER", "set.seed", "read_csv", "filter", "is", "na", "mutate", "mdy", "cut", "select", "group_by", "summarise", "mean", "n", "ungroup", "ggplot", "aes", "geom_bar", "labs", "theme_minimal", "createDataPartition", "glm", "predict", "table", "summary", "tidy", "write_csv", "saveRDS", "cat"
]

module.exports = {
    originalTextLongTestR,
    sameExpectedTokensLongTestR
};