library(jsonlite)


#Function to list objects from a package and then detach it
list_and_detach_package <- function(package_name) {
  # Construct the package library string
  package_lib <- paste("package", package_name, sep = ":")

  # Load the package
  library(package_name, character.only = TRUE)

  # List the objects in the package
  # https://stackoverflow.com/questions/30392542/is-there-a-command-in-r-to-view-all-the-functions-present-in-a-package
  objects <- ls(package_lib)

  # Detach the package
  detach(package_lib, unload = TRUE, character.only = TRUE)

  # Optionally, clear objects loaded by the package into the global environment
  rm(list = objects) # Uncomment this if you know objects are in the global environment

  # Return the list of objects
  return(objects)
}

json_file_path <- "assets/R_supported_packages.json"
packages <- fromJSON(json_file_path)
packages <- c("ggplot2", "dplyr")  # Replace with your list of packages

package_objects <- list()
for (pkg in packages) {
  package_objects[[pkg]] <- list_and_detach_package(pkg)
}

write_json(package_objects, "package_objects.json")
# print(package_objects)
