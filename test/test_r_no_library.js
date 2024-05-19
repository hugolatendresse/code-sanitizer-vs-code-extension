const originalTextRNoLibrary = `

library(somerandomdoesntexist)
library(whatisthisoneitdoesntexist)
require(anothermadeuplibrary)

set.seed(123)
data <- data.frame(
  ID = 1:1000,
  Age = sample(18:70, 1000, replace = TRUE),
  Income = round(rnorm(1000, mean = 50000, sd = 15000)),
  Gender = sample(c("Male", "Female"), 1000, replace = TRUE),
  Purchases = round(runif(1000, 1, 100))
)

# Data manipulation

# Convert Age to Age Group
data$AgeGroup <- cut(data$Age, breaks = c(17, 30, 50, 70), labels = c("18-30", "31-50", "51-70"))

# Summarize data to get average income and total purchases by Age Group and Gender
aggregate_data <- aggregate(cbind(Income, Purchases) ~ AgeGroup + Gender, data = data, FUN = function(x) c(Mean = mean(x), Total = sum(x)))

# Clean up the column names
colnames(aggregate_data) <- gsub("Income.", "", colnames(aggregate_data))
colnames(aggregate_data) <- gsub("Purchases.", "", colnames(aggregate_data))

# Modeling
# Fit a linear model to predict Income based on Age and Gender
model <- lm(Income ~ Age + Gender, data = data)

# Model summary
summary(model)

# Prediction
# Predict Income using the model
predictions <- predict(model, newdata = data)

# Evaluation
# Calculate residuals
residuals <- data$Income - predictions

# Plotting
# Plot Income Distribution
hist(data$Income, main = "Income Distribution", xlab = "Income", col = "lightblue", border = "darkblue")

# Boxplot of Income by Age Group
boxplot(Income ~ AgeGroup, data = data, main = "Income by Age Group", xlab = "Age Group", ylab = "Income", col = "lightgreen")

# Scatter plot of Income vs. Age with linear regression line
plot(data$Age, data$Income, main = "Income vs Age", xlab = "Age", ylab = "Income", pch = 19, col = "blue")
abline(lm(Income ~ Age, data = data), col = "red")

# Save the model to disk
save(model, file = "income_prediction_model.RData")

# Conclusion message
cat("Script execution complete. Model and plots generated.")
`


const sameExpectedTokensRNoLibrary = [
    "set.seed", "data.frame", "sample", "replace", "TRUE", "round", "rnorm", "mean", "sd", "runif", "cut", "labels", "aggregate", "cbind", "FUN", "function", "x", "gsub", "lm", "summary", "predict", "newdata", "hist", "main", "xlab", "col", "border", "boxplot", "ylab", "plot", "pch", "abline", "save", "file", "cat"
]

module.exports = {
    originalTextRNoLibrary,
    sameExpectedTokensRNoLibrary
};