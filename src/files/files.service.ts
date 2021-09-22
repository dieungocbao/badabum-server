import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PublicFile } from './publicFile.entity'

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
}
