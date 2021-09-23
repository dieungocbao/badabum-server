import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PublicFile } from './publicFile.entity'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private publicFilesRepository: Repository<PublicFile>,
  ) {}

  async uploadPublicFile(fileName: string, filePath: string) {
    const newFile = this.publicFilesRepository.create({
      key: fileName,
      url: filePath,
    })
    await this.publicFilesRepository.save(newFile)
    return newFile
  }

  async deletePublicFile(file: PublicFile) {
    try {
      fs.unlinkSync(path.join(__dirname, '/../../', file.url))
      await this.publicFilesRepository.delete(file.id)
    } catch (error) {
      console.log(error)
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
