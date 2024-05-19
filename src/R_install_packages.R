if (!require(jsonlite)) {
  install.packages("jsonlite")
}

json_file_path <- "../assets/R_supported_packages.json"
packages <- fromJSON(json_file_path)

install_packs <- function(packages)
{
    new_packages <- packages[!(packages %in% installed.packages()[, "Package"])]
    if (length(new_packages)) install.packages(new_packages)
}

load_packs <- function(packages)
{
    sapply(packages, require, character.only = TRUE)
}

install_packs(packages)