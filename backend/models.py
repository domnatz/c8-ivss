from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class MasterList(Base):
    __tablename__ = "masterlist"
    file_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    tags = relationship("Tags", back_populates="masterlist", cascade="all, delete")

class Assets(Base):
    __tablename__ = "assets"
    asset_id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)
    subgroups = relationship("Subgroups", back_populates="asset", cascade="all, delete")

class Subgroups(Base):
    __tablename__ = "subgroups"
    subgroup_id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.asset_id", ondelete="CASCADE"))
    subgroup_name = Column(String, nullable=False)
    asset = relationship("Assets", back_populates="subgroups")
    subgroup_tags = relationship("SubgroupTag", back_populates="subgroup", cascade="all, delete")
    templates = relationship("SubgroupTemplate", back_populates="subgroup", cascade="all, delete")

class Tags(Base):
    __tablename__ = "tags"
    tag_id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("masterlist.file_id", ondelete="CASCADE"))
    tag_name = Column(String, nullable=False)
    tag_type = Column(String, nullable=False)
    tag_data = Column(JSON)
    masterlist = relationship("MasterList", back_populates="tags")
    subgroup_tags = relationship("SubgroupTag", back_populates="tag", cascade="all, delete")

class SubgroupTag(Base):
    __tablename__ = "subgroup_tag"
    subgroup_tag_id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(Integer, ForeignKey("tags.tag_id", ondelete="CASCADE"))
    subgroup_id = Column(Integer, ForeignKey("subgroups.subgroup_id", ondelete="CASCADE"))
    parent_subgroup_tag_id = Column(Integer, ForeignKey("subgroup_tag.subgroup_tag_id", ondelete="CASCADE"), nullable=True)
    formula_id = Column(Integer, ForeignKey("formulas.formula_id", ondelete="SET NULL"), nullable=True)
    subgroup = relationship("Subgroups", back_populates="subgroup_tags")
    subgroup_tag_name = Column(String, nullable=False)  
    tag = relationship("Tags", back_populates="subgroup_tags")
    formula = relationship("Formulas", back_populates="subgroup_tags")
  

class Templates(Base):
    __tablename__ = "templates"
    template_id = Column(Integer, primary_key=True, index=True)
    formula_id = Column(Integer, ForeignKey("formulas.formula_id", ondelete="CASCADE"))
    template_name = Column(String, nullable=False)
    formula = relationship("Formulas", back_populates="templates")
    subgroups = relationship("SubgroupTemplate", back_populates="template", cascade="all, delete")

class Formulas(Base):
    __tablename__ = "formulas"
    formula_id = Column(Integer, primary_key=True, index=True)
    formula_name = Column(String, nullable=False)
    formula_desc = Column(String)
    formula_expression = Column(String, nullable=False)
    templates = relationship("Templates", back_populates="formula", cascade="all, delete")
    subgroup_tags = relationship("SubgroupTag", back_populates="formula")
    variables = relationship("FormulaVariable", back_populates="formula", cascade="all, delete")

class FormulaVariable(Base):
    __tablename__ = "formula_variables"
    variable_id = Column(Integer, primary_key=True, index=True)
    formula_id = Column(Integer, ForeignKey("formulas.formula_id", ondelete="CASCADE"))
    variable_name = Column(String, nullable=False)
    subgroup_tag_id = Column(Integer, ForeignKey("subgroup_tag.subgroup_tag_id", ondelete="SET NULL"), nullable=True)
    formula = relationship("Formulas", back_populates="variables")
    subgroup_tag = relationship("SubgroupTag")

class SubgroupTemplate(Base):
    __tablename__ = "subgroup_template"
    subgroup_id = Column(Integer, ForeignKey("subgroups.subgroup_id", ondelete="CASCADE"), primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.template_id", ondelete="CASCADE"), primary_key=True)
    subgroup = relationship("Subgroups", back_populates="templates")
    template = relationship("Templates", back_populates="subgroups")