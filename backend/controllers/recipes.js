const mongoose = require('mongoose'),
Schema = mongoose.Schema;

const jwt_decode = require('jwt-decode')
const User = require('../models/User')
const Recipe = require('../models/Recipe')
const Ingredient = require('../models/Ingredient')
const axios = require('axios')

const createRecipe = async (req, res) => {
    // console.log("this is the create food function!!!")
    // console.log("Request headers:")
    // const user = jwt_decode(req.headers.authorization)
    // console.log(user)

    // console.log(req.body)

    try {
        // const idOfUser = user.user.id


        let recipeImages = req.body.images

        let ingredients = req.body.ingredients

        console.log(ingredients)

        // images = []
        if (recipeImages === undefined){
            recipeImages = []
        } else {
            recipeImages.forEach(element => {
                element = element
            });
        }

        if (ingredients === undefined){
            ingredients = []
        } else {
            ingredients.forEach(element => {
                element = mongoose.Types.ObjectId(element)
            });
        }

        const newRecipe = await Recipe.create({
            name_en: req.body.name_en,
            name_ar: req.body.name_ar,
            description_en: req.body.description_en,
            description_ar: req.body.description_ar,
            images: recipeImages,
            ingredients: ingredients

        })


        return res.json({message: "Recipe got created"})

    } catch(err) {
        return res.json({error: "Error -> " + err}).status(400);
    }

}


const getAllRecipes = async (req, res) => {
    
    try {
        
        const allRecipes = await Recipe.find({}).populate(['ingredients'])
        
        return res.send(allRecipes)
        
    } catch (err) {
        return res.json(err)
    }
}


const getRecipeById = async (req, res) => {
    
    try {
        // const recipe = await Recipe.findById(req.params._id).populate(['ingredients', 'users_favorited'])
        const recipe = await Recipe.findById(mongoose.Types.ObjectId(req.params._id)).populate(['ingredients', 'users_favorited'])

        console.log(recipe)
        return res.json(recipe)
    } catch(err){
        return res.json(err)
    }
}


const updateRecipe = async (req, res) => {
    try {


        console.log(req.body)


        let recipeImages = req.body.images

        let ingredients = req.body.ingredients


        console.log("recipeImages", recipeImages)

        console.log("ingredients", ingredients)

        // images = []
        if (recipeImages){
            recipeImages.forEach(element => {
                element = element
            });
        }

        if (ingredients){
            ingredients.forEach(element => {
                element = mongoose.Types.ObjectId(element)
            });
        }


        let updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params._id,
            {
                name_en: req.body.name_en,
                name_ar: req.body.name_ar,
                description_en: req.body.description_en,
                description_ar: req.body.description_ar,
                images: recipeImages,
                ingredients: ingredients
            }
        )

        console.log(updatedRecipe)
        return res.json('Recipe updated')

    } catch (err) {
        return res.json(err)
    }
}

const deleteRecipe = async (req, res) => {

    try {
        await Recipe.findByIdAndDelete(
            req.params._id
            )
        return res.json({message: 'Recipe Deleted Successfully'})

    } catch (err) {
        return res.json(err)
    }
}



const createIngredient = async (req, res) => {
    try {

        let newIngredient = await Ingredient.create({
            name_en: req.body.name_en,
            name_ar: req.body.name_ar,
            quantity_en: req.body.quantity_en,
            quantity_ar: req.body.quantity_ar
        })

        console.log(newIngredient)

        return res.json({message: 'Ingredient Created Successfully'})
    
    }catch (err){
        return res.json(err)
    }
}


const getAllIngredients = async (req, res) => {
    try {

        let allIngredients = await Ingredient.find({})

        return res.json(allIngredients)

    }catch(err) {
        return res.json(err)
    }
}

const getIngredientById = async (req, res) => {

    try {
        const ingredient = await Ingredient.findById(req.params._id);
        return res.json(ingredient);
    } catch(err){
        return res.json(err)
    }
}

const updateIngredient = async (req, res) => {
    try {

        let updatedIngredient = await Ingredient.findByIdAndUpdate(
            req.params._id,
            req.body
        )

        console.log(updatedIngredient)
        return res.json('Ingredient Updated')

    } catch (err) {
        return res.json(err)
    }
}


const deleteIngredient = async (req, res) => {

    try {
        await Ingredient.findByIdAndDelete(
            req.params._id
            )
        return res.json({message: 'Recipe Deleted Successfully'})

    } catch (err) {
        return res.json(err)
    }
}




const addFavorite = async (req, res) => {

    const user = jwt_decode(req.headers.authorization)

    const idOfUser = user.user.id

    try {


        const userDb = await User.findByIdAndUpdate(
            idOfUser,
            { $push: { favorited_recipes: mongoose.Types.ObjectId(req.params._id) } },
            { new: true }
        )

        
        const recipe = await Recipe.findByIdAndUpdate(
            req.params._id,
            { $push: { users_favorited: mongoose.Types.ObjectId(idOfUser) } },
            { new: true }
        )


        return res.json({message: 'Recipe Got Favorited Successfully'})

    } catch (err) {
        return res.json(err)
    }
}


const removeFavorite = async (req, res) => {

    const user = jwt_decode(req.headers.authorization)
    const idOfUser = user.user.id

    try {

        const userDb = await User.findByIdAndUpdate(
            idOfUser,
            { $pull: { favorited_recipes: mongoose.Types.ObjectId(req.params._id) } },
            { new: true }
        )

        
        const recipe = await Recipe.findByIdAndUpdate(
            req.params._id,
            { $pull: { users_favorited: mongoose.Types.ObjectId(idOfUser) } },
            { new: true }
        )
            
        return res.json({message: 'Recipe Got Unfavorited Successfully'})

    } catch (err) {
        return res.json(err)
    }
}

const getAllUserFavorites = async (req, res) => {

    const user = jwt_decode(req.headers.authorization)
    const idOfUser = user.user.id

    try {

        const userRecipes = await User.findById(idOfUser).populate('favorited_recipes')

        return res.json(userRecipes.favorited_recipes)

    } catch (err) {
        return res.json(err)
    }
}

const predictFood = async (req, res) => {

    try {


        console.log(req.body.image)

        const image = req.body.image

        // API CALL to FastAPI ML Model
        // Add the image from the react reponse and send it to fastAPI

        const formData = new FormData()

        formData.append('image', image)

        axios.post('http://localhost:8000/predict', formData)
        .then((res) => {
            // runs before api call

            // should return the recipe class
            console.log(res.data)


            const recipePrediction = 'Machboos'
            
            
            // get the name then request from the db for the full recipe data
            Recipe.findOne({name_en: recipePrediction}).populate(['ingredients', 'users_favorited'])
            .then(res => {

                // database response
                recipe = res

                console.log(recipe)

                return res.json(recipe)
            })
            .catch(err => {
                console.log(err)
                return res.json(err)
            })

        // const recipe = await Recipe.findOne({name_en: recipePrediction}).populate(['ingredients', 'users_favorited'])

        // // send the db recipe data to the frontend

        // // return res.json(req.body.image)

        // console.log(recipe)

        // return res.json(recipe)


        })
        .catch(err => {
            console.log(err)

            return res.json(err)
        })


        // const recipePrediction = 'Machboos'
        // // get the name then request from the db for the full recipe data



        // const recipe = await Recipe.findOne({name_en: recipePrediction}).populate(['ingredients', 'users_favorited'])

        // // send the db recipe data to the frontend

        // // return res.json(req.body.image)

        // console.log(recipe)

        // return res.json(recipe)
        // // return res.json({"response": "responseData"})
    
    }catch(err){
        return res.json(err)
    }
}


module.exports = {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    createIngredient,
    getAllIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
    addFavorite,
    removeFavorite,
    getAllUserFavorites,
    predictFood
}