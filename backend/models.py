from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class MasterList(Base):
    __tablename__ = "masterlist"
    
    file_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)

    tags = relationship("Tags", back_populates="masterlist")


class Assets(Base):
    __tablename__ = "assets"
    
    asset_id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)

    subgroups = relationship("Subgroups", back_populates="asset")


class Subgroups(Base):
    __tablename__ = "subgroups"
    
    subgroup_id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.asset_id"))
    subgroup_name = Column(String, nullable=False)

    asset = relationship("Assets", back_populates="subgroups")
    subgroup_tags = relationship("SubgroupTag", back_populates="subgroup")
    templates = relationship("SubgroupTemplate", back_populates="subgroup")


class Tags(Base):
    __tablename__ = "tags"
    
    tag_id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("masterlist.file_id"))
    tag_name = Column(String, nullable=False)
    tag_type = Column(String, nullable=False)
    tag_data = Column(JSON)

    masterlist = relationship("MasterList", back_populates="tags")


class SubgroupTag(Base):
    __tablename__ = "subgroup_tag"
    
    subgroup_tag_id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(Integer, ForeignKey("tags.tag_id"))
    subgroup_id = Column(Integer, ForeignKey("subgroups.subgroup_id"))

    subgroup = relationship("Subgroups", back_populates="subgroup_tags")


class Templates(Base):
    __tablename__ = "templates"
    
    template_id = Column(Integer, primary_key=True, index=True)
    formula_id = Column(Integer, ForeignKey("formulas.formula_id"))
    template_name = Column(String, nullable=False)

    formula = relationship("Formulas", back_populates="templates")
    subgroups = relationship("SubgroupTemplate", back_populates="template")


class Formulas(Base):
    __tablename__ = "formulas"
    
    formula_id = Column(Integer, primary_key=True, index=True)
    formula_name = Column(String, nullable=False)
    formula_desc = Column(String)
    formula_expression = Column(String, nullable=False)
    num_parameters = Column(Integer, nullable=False)

    templates = relationship("Templates", back_populates="formula")


class SubgroupTemplate(Base):
    __tablename__ = "subgroup_template"
    
    subgroup_id = Column(Integer, ForeignKey("subgroups.subgroup_id"), primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.template_id"), primary_key=True)

    subgroup = relationship("Subgroups", back_populates="templates")
    template = relationship("Templates", back_populates="subgroups")
