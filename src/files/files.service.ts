import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryRunner, Repository } from 'typeorm'
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

  async deletePublicFile(fileId: number) {
    try {
      const file = await this.publicFilesRepository.findOne({ id: fileId })
      if (!file) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND)
      }
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

  async deletePublicFileWithQueryRunner(
    fileId: number,
    queryRunner: QueryRunner,
  ) {
    const file = await queryRunner.manager.findOne(PublicFile, { id: fileId })
    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND)
    }
    fs.unlinkSync(path.join(__dirname, '/../../', file.url))
    await queryRunner.manager.delete(PublicFile, fileId)
  }
}
