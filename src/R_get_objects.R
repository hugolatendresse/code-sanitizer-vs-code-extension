library(jsonlite)

setwd("C:\\Users\\hugol\\Code\\code-sanitizer-vs-code-extension")

# Function to list objects from a package and then detach it
list_and_detach_package <- function(package_name) {
  # Construct the package library string
  package_lib <- paste("package", package_name, sep = ":")
  
  # Attempt to load the package and list its objects
  tryCatch({
    # Load the package
    library(package_name, character.only = TRUE)
    
    # List the objects in the package
    objects <- ls(package_lib)
    
    # Detach the package
    detach(package_lib, unload = TRUE, character.only = TRUE)
    
    # Optionally, clear objects loaded by the package into the global environment
    rm(list = objects) # Uncomment this if you know objects are in the global environment
    
    # Return the list of objects
    objects
  }, error = function(e) {
    message(paste("Error processing package:", package_name, "Error:", e$message))
    NULL  # Return NULL if there was an error
  })
}

json_file_path <- "assets/R_supported_packages.json"
packages <- fromJSON(json_file_path)
# packages <- c("ggplot2", "dplyr")  # Replace with your list of packages
print(packages)

# File to store the results incrementally
output_file <- "assets/R_packages_objects_inc.json"

# Check if the output file already exists and initialize it if not
if (!file.exists(output_file)) {
  write_json(list(), output_file)
}

# Process each package and append to JSON after each call
for (pkg in packages) {
  objects <- list_and_detach_package(pkg)
  if (!is.null(objects)) {
    # Read the current JSON data
    current_data <- fromJSON(output_file)
    # Update the list for this package
    current_data[[pkg]] <- objects
    # Write back to the JSON file
    write_json(current_data, output_file)
  }
}

print(fromJSON(output_file))
