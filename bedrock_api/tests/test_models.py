"""
Tests for Pydantic models
"""
import pytest
from pydantic import ValidationError
from app.models.chicken import ChickenInfo, FeedComposition, VitaminComposition, MineralComposition

class TestChickenInfo:
    """Test ChickenInfo model validation"""
    
    def test_valid_chicken_info(self):
        """Test valid chicken info creation"""
        chicken_info = ChickenInfo(
            count=150,
            breed="laying hen",
            average_weight_kg=2.5,
            age_weeks=10
        )
        assert chicken_info.count == 150
        assert chicken_info.breed == "laying hen"
        assert chicken_info.average_weight_kg == 2.5
        assert chicken_info.age_weeks == 10
        assert chicken_info.season is None
    
    def test_chicken_info_with_season(self):
        """Test chicken info with valid season"""
        chicken_info = ChickenInfo(
            count=100,
            breed="broiler",
            average_weight_kg=1.5,
            age_weeks=8,
            season="winter"
        )
        assert chicken_info.season == "winter"
    
    def test_invalid_count_too_low(self):
        """Test validation error for count too low"""
        with pytest.raises(ValidationError):
            ChickenInfo(
                count=0,
                breed="laying hen",
                average_weight_kg=2.5,
                age_weeks=10
            )
    
    def test_invalid_count_too_high(self):
        """Test validation error for count too high"""
        with pytest.raises(ValidationError):
            ChickenInfo(
                count=20000,
                breed="laying hen",
                average_weight_kg=2.5,
                age_weeks=10
            )
    
    def test_invalid_weight_too_low(self):
        """Test validation error for weight too low"""
        with pytest.raises(ValidationError):
            ChickenInfo(
                count=150,
                breed="laying hen",
                average_weight_kg=0.05,
                age_weeks=10
            )
    
    def test_invalid_season(self):
        """Test validation error for invalid season"""
        with pytest.raises(ValidationError):
            ChickenInfo(
                count=150,
                breed="laying hen",
                average_weight_kg=2.5,
                age_weeks=10,
                season="invalid_season"
            )
    
    def test_breed_normalization(self):
        """Test breed name normalization"""
        chicken_info = ChickenInfo(
            count=150,
            breed="  LAYING HEN  ",
            average_weight_kg=2.5,
            age_weeks=10
        )
        assert chicken_info.breed == "laying hen"
    
    def test_season_normalization(self):
        """Test season normalization"""
        chicken_info = ChickenInfo(
            count=150,
            breed="laying hen",
            average_weight_kg=2.5,
            age_weeks=10,
            season="WINTER"
        )
        assert chicken_info.season == "winter"

class TestFeedComposition:
    """Test FeedComposition model"""
    
    def test_valid_feed_composition(self):
        """Test valid feed composition creation"""
        vitamins = VitaminComposition(
            vitamin_a_iu_per_kg=8000,
            vitamin_d3_iu_per_kg=2000,
            vitamin_e_iu_per_kg=25
        )
        
        minerals = MineralComposition(
            sodium_percent=0.18,
            chloride_percent=0.20,
            magnesium_percent=0.12
        )
        
        feed_comp = FeedComposition(
            crude_protein_percent=18.5,
            metabolizable_energy_kcal_per_kg=2800,
            crude_fat_percent=4.0,
            crude_fiber_percent=4.5,
            calcium_percent=3.8,
            phosphorus_percent=0.65,
            lysine_percent=0.95,
            methionine_percent=0.38,
            vitamins=vitamins,
            minerals=minerals
        )
        
        assert feed_comp.crude_protein_percent == 18.5
        assert feed_comp.metabolizable_energy_kcal_per_kg == 2800
        assert feed_comp.vitamins.vitamin_a_iu_per_kg == 8000
        assert feed_comp.minerals.sodium_percent == 0.18
    
    def test_invalid_percentage_over_100(self):
        """Test validation error for percentage over 100"""
        vitamins = VitaminComposition(
            vitamin_a_iu_per_kg=8000,
            vitamin_d3_iu_per_kg=2000,
            vitamin_e_iu_per_kg=25
        )
        
        minerals = MineralComposition(
            sodium_percent=0.18,
            chloride_percent=0.20,
            magnesium_percent=0.12
        )
        
        with pytest.raises(ValidationError):
            FeedComposition(
                crude_protein_percent=150.0,  # Invalid: over 100%
                metabolizable_energy_kcal_per_kg=2800,
                crude_fat_percent=4.0,
                crude_fiber_percent=4.5,
                calcium_percent=3.8,
                phosphorus_percent=0.65,
                lysine_percent=0.95,
                methionine_percent=0.38,
                vitamins=vitamins,
                minerals=minerals
            )
