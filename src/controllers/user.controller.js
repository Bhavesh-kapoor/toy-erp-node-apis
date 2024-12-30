import express from "express";
import {getUser} from '#services/user'

const get = async(req,res,next) =>{
    try{
        const {id} = req.params;
        const filter = req.query;
        const userData = await getUser(id,filter);
    

    }catch(err){
        next(err)
    }
}