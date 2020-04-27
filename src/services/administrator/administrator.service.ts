import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entities/administrator.entity';
import { Repository, Admin } from 'typeorm';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import * as crypto from 'crypto';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator)
        private readonly administrator: Repository<Administrator>,

    ){ }

    getAll(): Promise<Administrator[]>{
        return this.administrator.find();
    }
    async getByUsername(username: string): Promise<Administrator | null>{
        const admin = await this.administrator.findOne({
            username: username
        });
        if(admin){
            return admin;
        }
        return null;
    }
    getById(id: number): Promise<Administrator | ApiResponse>{
        return this.administrator.findOne(id);
    }
    add(data: AddAdministratorDto): Promise<Administrator | ApiResponse>{
      
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);

        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        let newAdmin: Administrator = new Administrator();
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return new Promise((resolve)=> {
            this.administrator.save(newAdmin)
            .then(data => resolve(data))
            .catch(error => {
                const response: ApiResponse = new ApiResponse("error", -1001);
                resolve(response);
            });
        }) ;

        //DTO => Model
        //username -> username
        //password -[~] -> passwordHash ! stvar izbora
    }

    async editById(id: number, data: EditAdministratorDto): Promise<Administrator | ApiResponse>{
        let admin: Administrator = await this.administrator.findOne(id);

        if(admin === undefined){
            return new Promise((resolve) => {
                resolve(new ApiResponse("error", -1002));
            });
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        admin.passwordHash = passwordHashString;

        return this.administrator.save(admin);

    }

}