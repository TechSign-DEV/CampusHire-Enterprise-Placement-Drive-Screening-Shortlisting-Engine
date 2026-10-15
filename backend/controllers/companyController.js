
import Company from "../models/Company.js";

export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      recruiter: req.user._id
    }).populate("recruiter", "name email");

    return res.json({ company });
  } catch (error) {
    console.error("Get company error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch company profile"
    });
  }
};

export const saveMyCompany = async (req, res) => {
  try {
    const { name, industry, website, location, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Company name is required"
      });
    }

    if (
      website &&
      !/^https?:\/\/\S+$/i.test(website.trim())
    ) {
      return res.status(400).json({
        message: "Website must start with http:// or https://"
      });
    }

    const company = await Company.findOneAndUpdate(
      { recruiter: req.user._id },
      {
        $set: {
          name: name.trim(),
          industry: industry?.trim() || "",
          website: website?.trim() || "",
          location: location?.trim() || "",
          description: description?.trim() || ""
        },
        $setOnInsert: {
          recruiter: req.user._id
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      message: "Company profile saved successfully",
      company
    });
  } catch (error) {
    console.error("Save company error:", error.message);
    return res.status(500).json({
      message: "Failed to save company profile"
    });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("recruiter", "name email")
      .sort({ name: 1 });

    return res.json({
      count: companies.length,
      companies
    });
  } catch (error) {
    console.error("List companies error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch companies"
    });
  }
};
